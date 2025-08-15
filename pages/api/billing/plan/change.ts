// pages/api/billing/plan/change.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripe";
import { loadCompanyByExternalId, pickStripeSubscription } from "@/lib/subscription-helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");
  try {
    const { price_id } = (req.body ?? {}) as { price_id?: string };
    if (!price_id) return res.status(400).json({ error: "Missing price_id" });

    const { external_id, company } = await loadCompanyByExternalId(req);
    if (!external_id || !company) return res.status(404).json({ error: "Company not found" });

    const subId = pickStripeSubscription(company);
    if (!subId) return res.status(404).json({ error: "Subscription not found" });

    const sub = await stripe.subscriptions.retrieve(subId);
    const itemId = sub.items.data[0]?.id;
    if (!itemId) return res.status(400).json({ error: "No subscription item" });

    await stripe.subscriptions.update(subId, {
      cancel_at_period_end: false, // plan değişimi hemen
      items: [{ id: itemId, price: price_id }],
      proration_behavior: "create_prorations",
    });

    return res.status(200).json({ ok: true });
  } catch (e: any) {
    console.error("plan/change.ts error:", e?.message || e);
    res.status(500).json({ error: "Failed to change plan" });
  }
}
