// /pages/api/billing/subscription.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  getExternalId,
  getDbSubscription,
  getStripeSubscription,
  mapStripeStatus,
  type ApiSubscription,
} from "./_shared";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const externalId = getExternalId(req, res);
  if (!externalId) return;

  try {
    // 1) DB kaydı
    const dbSub = await getDbSubscription(externalId);
    if (!dbSub) {
      res.status(404).json({ error: "Subscription not found" });
      return;
    }

    // 2) Stripe subscription (varsa)
    const stripeSub = await getStripeSubscription(dbSub.stripe_subscription_id);

    // 3) Güvenli alan okuma (any-cast ile, tip çakışmalarını by-pass eder)
    const s: any = stripeSub || {};
    const periodEndIso: string | null =
      typeof s.current_period_end === "number"
        ? new Date(s.current_period_end * 1000).toISOString()
        : null;

    const firstItemPriceId: string | null =
      s?.items?.data?.[0]?.price?.id ?? null;

    // 4) Normalize edilmiş çıktı
    const out: ApiSubscription = {
      status: mapStripeStatus(s?.status ?? null),
      current_period_end: periodEndIso,
      cancel_at_period_end: !!s?.cancel_at_period_end,
      // price_id öncelik: Stripe item → DB fallback
      price_id: firstItemPriceId ?? dbSub.stripe_price_id ?? null,
      // geriye dönük — artık price_id kullanıyoruz
      plan_id: null,
    };

    res.status(200).json(out);
  } catch (e) {
    console.error("subscription api error:", e);
    res.status(500).json({ error: "Failed to load subscription" });
  }
}
