// /pages/api/billing/_shared.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import Stripe from "stripe";

export const prisma = new PrismaClient();

// Stripe API version: senin kullandığın tarihli sürüm
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil",
});

/** UI'da göstereceğimiz statüler */
export type UiStatus = "ACTIVE" | "CANCELLED" | "PENDING" | "PAST_DUE";

export type ApiSubscription = {
  status: UiStatus;
  current_period_end: string | null;   // ISO
  cancel_at_period_end: boolean;
  price_id: string | null;             // Stripe price id
  plan_id: "monthly" | "annual" | null;
};

/** Cookie / header / query'den external_id bul; yoksa 401 dön ve null ver */
export function getExternalId(req: NextApiRequest, res: NextApiResponse): string | null {
  const ext =
    (req.cookies?.external_id as string | undefined) ||
    (req.headers["x-external-id"] as string | undefined) ||
    (req.query.external_id as string | undefined) ||
    null;

  if (!ext) {
    res.status(401).json({ error: "external_id missing" });
    return null;
  }
  return ext;
}

/** DB'den subscriptions kaydını çek (sadece gereken alanlar) */
export async function getDbSubscription(externalId: string) {
  return prisma.subscriptions.findUnique({
    where: { external_id: externalId },
    select: {
      external_id: true,
      stripe_customer_id: true,
      stripe_subscription_id: true,
      stripe_price_id: true,
      review_status: true,
      hoxton_status: true,
      first_paid_at: true,
      start_date: true,
    },
  });
}

/** Stripe subscription'ı güvenli şekilde getir (TİP ÖNEMLİ!) */
export async function getStripeSubscription(
  stripeSubscriptionId?: string | null
): Promise<Stripe.Subscription | null> {
  if (!stripeSubscriptionId) return null;
  try {
    const sub = await stripe.subscriptions.retrieve(stripeSubscriptionId);
    // Türü açıkça Stripe.Subscription
    return sub as Stripe.Subscription;
  } catch (e: any) {
    // 404 vs → null
    if (e?.statusCode === 404) return null;
    throw e;
  }
}

/** Stripe status -> UI status map */
export function mapStripeStatus(s?: Stripe.Subscription.Status): UiStatus {
  switch (s) {
    case "active":
      return "ACTIVE";
    case "past_due":
      return "PAST_DUE";
    case "canceled":
    case "incomplete_expired":
      return "CANCELLED";
    default:
      return "PENDING";
  }
}
