// pages/api/billing/subscription/cancel.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripe";
import { loadCompanyByExternalId, pickStripeSubscription } from "@/lib/subscription-helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");
  try {
    const { external_id, company } = await loadCompanyByExternalId(req);
    if (!external_id || !company) return res.status(404).json({ error: "Company not found" });

    const subId = pickStripeSubscription(company);
    if (!subId) return res.status(404).json({ error: "Subscription not found" });

    await stripe.subscriptions.update(subId, { cancel_at_period_end: true });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("subscription/cancel.ts error:", e?.message || e);
    res.status(500).json({ error: "Failed to schedule cancellation" });
  }
}
