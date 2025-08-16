// /pages/api/billing/_shared.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { PrismaClient } from "@prisma/client";

export type ApiSubscription = {
  status: "ACTIVE" | "CANCELLED" | "PENDING" | "PAST_DUE";
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  price_id: string | null;
  plan_id: null;
};

export const prisma = new PrismaClient();

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  //apiVersion: "2025-07-30.basil",
});

export function getExternalId(req: NextApiRequest, res: NextApiResponse): string | null {
  const cookie = req.cookies?.external_id;
  const hdr = req.headers["x-external-id"];
  const q = (req.query?.external_id as string) || undefined;
  const id = (cookie || hdr || q || "").toString().trim();
  if (!id) {
    res.status(401).json({ error: "external_id not found on request" });
    return null;
  }
  return id;
}

/** DB’den subscriptions tekil kaydı çek (minimum alanlarla) */
export async function getDbSubscription(externalId: string) {
  return prisma.subscriptions.findUnique({
    where: { external_id: externalId },
    select: {
      external_id: true,
      stripe_customer_id: true,
      stripe_subscription_id: true,
      stripe_price_id: true,
    },
  });
}

/** Stripe subscription detayını getir (yoksa null) */
export async function getStripeSubscription(
  stripeSubId?: string | null
): Promise<Stripe.Subscription | null> {
  if (!stripeSubId) return null;
  try {
    const sub = await stripe.subscriptions.retrieve(stripeSubId);
    // Bazı Stripe SDK sürümlerinde Response<Subscription> dönüyor → Subscription’a cast ediyoruz
    return sub as unknown as Stripe.Subscription;
  } catch {
    return null;
  }
}

export function mapStripeStatus(input?: Stripe.Subscription.Status | null): ApiSubscription["status"] {
  if (!input) return "PENDING";
  if (input === "active" || input === "trialing") return "ACTIVE";
  if (
    input === "past_due" ||
    input === "incomplete" ||
    input === "incomplete_expired" ||
    input === "unpaid"
  )
    return "PAST_DUE";
  if (input === "canceled") return "CANCELLED";
  return "PENDING";
}

/** external_id → Stripe Customer’ı bul/oluştur. DB'deki stripe_customer_id öncelikli. */
export async function ensureStripeCustomer(externalId: string) {
  const db = await getDbSubscription(externalId).catch(() => null);
  if (db?.stripe_customer_id) {
    try {
      const c = await stripe.customers.retrieve(db.stripe_customer_id);
      if (!("deleted" in c) || !c.deleted) return c as Stripe.Customer;
    } catch {}
  }

  try {
    const list = await stripe.customers.list({
      limit: 1,
      expand: ["data.invoice_settings.default_payment_method"],
      // @ts-ignore → Search API
      query: `metadata['external_id']:'${externalId}'`,
    } as any);
    if (list?.data?.[0]) return list.data[0] as Stripe.Customer;
  } catch {}

  const created = await stripe.customers.create({
    metadata: { external_id: externalId },
  });

  if (db?.external_id) {
    await prisma.subscriptions
      .update({
        where: { external_id: externalId },
        data: { stripe_customer_id: created.id },
      })
      .catch(() => {});
  }
  return created;
}

/** Minimal billing address tipi (UI ile aynı key’ler) */
export type BillingAddress = {
  name?: string;
  company?: string;
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
  email?: string;
  phone?: string;
};

/** Stripe Customer → UI adresi */
export function toUiAddress(c: Stripe.Customer): BillingAddress {
  const a = (c.address ?? {}) as Stripe.AddressParam;
  return {
    name: (c.name ?? "") || undefined,
    company: (c.metadata?.company as string) || undefined,
    line1: a?.line1 ?? undefined,
    line2: a?.line2 ?? undefined,
    city: a?.city ?? undefined,
    state: a?.state ?? undefined,
    postal_code: a?.postal_code ?? undefined,
    country: a?.country ?? undefined,
    email: (c.email ?? "") || undefined,
    phone: (c.phone ?? "") || undefined,
  };
}

/** UI adresi → Stripe Customer update payload */
export function toStripeCustomerUpdate(
  addr: BillingAddress
): Stripe.CustomerUpdateParams {
  const address: Stripe.AddressParam = {
    line1: addr.line1 || undefined,
    line2: addr.line2 || undefined,
    city: addr.city || undefined,
    state: addr.state || undefined,
    postal_code: addr.postal_code || undefined,
    country: addr.country || undefined,
  };

  const update: Stripe.CustomerUpdateParams = {
    name: addr.name || undefined,
    metadata: { company: addr.company || "" },
    email: addr.email || undefined,
    phone: addr.phone || undefined,
    address,
    invoice_settings: {
      custom_fields: addr.company
        ? [{ name: "Company", value: addr.company.substring(0, 30) }]
        : null,
    },
  };
  return update;
}
