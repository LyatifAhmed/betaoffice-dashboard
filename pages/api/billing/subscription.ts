// /pages/api/billing/subscription.ts
import type { NextApiRequest, NextApiResponse } from "next";
import type Stripe from "stripe";
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

    // 2) Stripe subscription (yoksa null)
    const stripeSub = (await getStripeSubscription(
      dbSub.stripe_subscription_id
    )) as Stripe.Subscription | null;

    // 3) Güvenli alan okuma
    const currentPeriodEndIso: string | null =
      stripeSub && typeof stripeSub.current_period_end === "number"
        ? new Date(stripeSub.current_period_end * 1000).toISOString()
        : null;

    const out: ApiSubscription = {
      status: mapStripeStatus(stripeSub?.status),
      current_period_end: currentPeriodEndIso,
      cancel_at_period_end: Boolean(stripeSub?.cancel_at_period_end),
      price_id:
        (stripeSub?.items?.data?.[0]?.price?.id as string | undefined) ??
        dbSub.stripe_price_id ??
        null,
      // geriye dönük alan (artık price_id kullanılıyor)
      plan_id: null,
    };

    res.status(200).json(out);
  } catch (e) {
    console.error("subscription api error:", e);
    res.status(500).json({ error: "Failed to load subscription" });
  }
}
