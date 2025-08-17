// /pages/api/billing/subscription.ts
import type { NextApiRequest, NextApiResponse } from "next";
import {
  getExternalId,
  getDbSubscription,
  getStripeSubscription,
  mapStripeStatus,
  type ApiSubscription,
} from "./_shared";

type ApiSubscriptionExtended = ApiSubscription & {
  // UI fallback için ek alanlar
  price_interval?: "month" | "year" | null;
  price_unit_amount?: number | null; // pennies
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const externalId = getExternalId(req, res);
  if (!externalId) return;

  try {
    const dbSub = await getDbSubscription(externalId);
    if (!dbSub) {
      res.status(404).json({ error: "Subscription not found" });
      return;
    }

    const stripeSub = await getStripeSubscription(dbSub.stripe_subscription_id);

    const s: any = stripeSub || {};
    const periodEndIso: string | null =
      typeof s.current_period_end === "number"
        ? new Date(s.current_period_end * 1000).toISOString()
        : null;

    const firstItem: any = s?.items?.data?.[0] || null;
    const firstPrice: any = firstItem?.price || null;

    const out: ApiSubscriptionExtended = {
      status: mapStripeStatus(s?.status ?? null),
      current_period_end: periodEndIso,
      cancel_at_period_end: !!s?.cancel_at_period_end,
      price_id: firstPrice?.id ?? dbSub.stripe_price_id ?? null,
      plan_id: null,

      // Fallback gösterim için:
      price_interval: firstPrice?.recurring?.interval ?? null, // "month" | "year"
      price_unit_amount: typeof firstPrice?.unit_amount === "number" ? firstPrice.unit_amount : null,
    };

    res.status(200).json(out);
  } catch (e) {
    console.error("subscription api error:", e);
    res.status(500).json({ error: "Failed to load subscription" });
  }
}
