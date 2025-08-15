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

    // 3) Normalize et
    const out: ApiSubscription = {
      status: mapStripeStatus(stripeSub?.status),
      current_period_end:
        stripeSub?.current_period_end != null
          ? new Date((stripeSub.current_period_end as number) * 1000).toISOString()
          : null,
      cancel_at_period_end: !!stripeSub?.cancel_at_period_end,
      price_id:
        (stripeSub?.items?.data?.[0]?.price?.id as string | undefined) ??
        dbSub.stripe_price_id ??
        null,
      // geriye dönük alan (artık price_id kullan)
      plan_id: null,
    };

    res.status(200).json(out);
  } catch (e) {
    console.error("subscription api error:", e);
    res.status(500).json({ error: "Failed to load subscription" });
  }
}
