// pages/api/billing/subscription.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil",
});

type SubscriptionDTO = {
  price_id?: string | null;
  // eski UI ile uyum için (gerekirse doldurulur)
  plan_id?: "monthly" | "annual" | null;

  status: "ACTIVE" | "CANCELLED" | "PENDING" | "PAST_DUE";
  current_period_end?: string | null;      // ← TS tipinde mevcut
  cancel_at_period_end?: boolean | null;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1) external_id bulun
    const externalId =
      (req.cookies?.external_id as string | undefined) ||
      (req.headers["x-external-id"] as string | undefined) ||
      (req.query.external_id as string | undefined) ||
      null;

    if (!externalId) {
      // Login olmamış kullanıcı – boş dönelim (404 yerine UI kırılmasın)
      const empty: SubscriptionDTO = {
        status: "PENDING",
        price_id: null,
        plan_id: null,
        current_period_end: null,
        cancel_at_period_end: null,
      };
      return res.status(200).json(empty);
    }

    // 2) Backend'ten müşteri/abonelik ID'lerini çek
    const backend = getBackendUrl().replace(/\/$/, "");
    const companyResp = await fetch(
      `${backend}/company?external_id=${encodeURIComponent(externalId)}`,
      withBasicAuth({ headers: { accept: "application/json" } })
    );

    if (!companyResp.ok) {
      // 404 ise sessiz; diğerleri log'lanabilir
      if (companyResp.status !== 404) {
        const text = await companyResp.text().catch(() => "");
        console.warn("company fetch warn", companyResp.status, text);
      }
      const empty: SubscriptionDTO = {
        status: "PENDING",
        price_id: null,
        plan_id: null,
        current_period_end: null,
        cancel_at_period_end: null,
      };
      return res.status(200).json(empty);
    }

    const company = await companyResp.json();
    const stripeCustomerId = company?.stripe_customer_id || null;
    const knownSubId = company?.stripe_subscription_id || null;

    if (!stripeCustomerId && !knownSubId) {
      const empty: SubscriptionDTO = {
        status: "PENDING",
        price_id: null,
        plan_id: null,
        current_period_end: null,
        cancel_at_period_end: null,
      };
      return res.status(200).json(empty);
    }

    // 3) Stripe'tan aboneliği bul
    let sub: Stripe.Response<Stripe.Subscription> | null = null;

    if (knownSubId) {
      try {
        sub = await stripe.subscriptions.retrieve(knownSubId, { expand: ["items.data.price"] });
      } catch (e) {
        // düşer, müşteri üzerinden deneyeceğiz
      }
    }

    if (!sub && stripeCustomerId) {
      // Müşteri üzerinden en güncel aktif/deneme aboneliği al
      const list = await stripe.subscriptions.list({
        customer: stripeCustomerId,
        status: "all",
        limit: 3,
        expand: ["data.items.data.price"],
      });
      sub =
        list.data.find((s) => s.status === "active" || s.status === "trialing") ||
        list.data[0] ||
        null;
    }

    if (!sub) {
      const empty: SubscriptionDTO = {
        status: "PENDING",
        price_id: null,
        plan_id: null,
        current_period_end: null,
        cancel_at_period_end: null,
      };
      return res.status(200).json(empty);
    }

    // 4) Normalize et
    const priceId =
      sub.items?.data?.[0]?.price?.id ??
      (Array.isArray(sub.items?.data) && sub.items.data.length > 0 ? sub.items.data[0].price?.id : null) ??
      null;

    const unixEnd = sub.current_period_end || null;
    const currentPeriodEndIso = unixEnd ? new Date(unixEnd * 1000).toISOString() : null;

    const status: SubscriptionDTO["status"] =
      sub.status === "active" || sub.status === "trialing"
        ? "ACTIVE"
        : sub.status === "canceled"
        ? "CANCELLED"
        : sub.status === "past_due" || sub.status === "unpaid" || sub.status === "incomplete"
        ? "PAST_DUE"
        : "PENDING";

    // Opsiyonel: env’deki price id ile eski "plan_id" tahmini
    const envMonthly = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_PRICE_ID;
    const envAnnual = process.env.NEXT_PUBLIC_STRIPE_ANNUAL_PRICE_ID;
    let planId: SubscriptionDTO["plan_id"] = null;
    if (priceId && envMonthly && priceId === envMonthly) planId = "monthly";
    if (priceId && envAnnual && priceId === envAnnual) planId = "annual";

    const payload: SubscriptionDTO = {
      price_id: priceId,
      plan_id: planId,
      status,
      current_period_end: currentPeriodEndIso,         // ← Artık tipte var
      cancel_at_period_end: sub.cancel_at_period_end ?? null,
    };

    return res.status(200).json(payload);
  } catch (err: any) {
    console.error("billing/subscription error:", err?.message || err);
    const fallback: SubscriptionDTO = {
      status: "PENDING",
      price_id: null,
      plan_id: null,
      current_period_end: null,
      cancel_at_period_end: null,
    };
    return res.status(200).json(fallback);
  }
}
