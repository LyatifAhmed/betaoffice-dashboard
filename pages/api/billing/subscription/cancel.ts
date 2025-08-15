// pages/api/billing/subscription/cancel.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getExternalId, getDbSubscription, stripe } from "../_shared";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");
  const external_id = getExternalId(req, res);
  if (!external_id) return res.status(400).json({ error: "external_id missing" });

  const dbSub = await getDbSubscription(external_id);
  if (!dbSub?.stripe_subscription_id) {
    return res.status(400).json({ error: "No Stripe subscription on file" });
  }

  const updated = await stripe.subscriptions.update(dbSub.stripe_subscription_id, {
    cancel_at_period_end: true,
  });

  return res.status(200).json({ ok: true, cancel_at_period_end: updated.cancel_at_period_end });
}
