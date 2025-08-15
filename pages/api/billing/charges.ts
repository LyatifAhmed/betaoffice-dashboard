// pages/api/billing/charges.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripe";
import { loadCompanyByExternalId, pickStripeCustomer } from "@/lib/subscription-helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { external_id, company } = await loadCompanyByExternalId(req);
    if (!external_id || !company) return res.status(200).json([]);

    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
    const customerId = pickStripeCustomer(company);
    if (!customerId) return res.status(200).json([]);

    const list = await stripe.charges.list({ customer: customerId, limit });
    const rows = list.data.map(c => ({
      id: c.id,
      created: c.created ? new Date(c.created * 1000).toISOString() : null,
      amount_pennies: c.amount || 0,
      currency: (c.currency || "gbp").toUpperCase(),
      status: c.status || "pending",
      description: c.description || undefined,
      receipt_url: c.receipt_url || undefined,
    }));

    res.status(200).json(rows);
  } catch (e: any) {
    console.error("charges.ts error:", e?.message || e);
    res.status(500).json({ error: "Failed to load charges" });
  }
}
