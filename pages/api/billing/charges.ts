// pages/api/billing/charges.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getExternalId, getDbSubscription, stripe } from "./_shared";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  const external_id = getExternalId(req, res);
  if (!external_id) return res.status(200).json([]);

  const dbSub = await getDbSubscription(external_id);
  if (!dbSub?.stripe_customer_id) return res.status(200).json([]);

  const limit = Math.min(Number(req.query.limit ?? 20), 50);
  const list = await stripe.charges.list({ customer: dbSub.stripe_customer_id, limit });

  const results = list.data.map((c) => ({
    id: c.id,
    created: c.created ? new Date(c.created * 1000).toISOString() : null,
    amount_pennies: c.amount ?? 0,
    currency: (c.currency || "gbp").toUpperCase(),
    status: (c.status ?? "pending") as "succeeded" | "pending" | "failed",
    description: c.description ?? undefined,
    receipt_url: c.receipt_url ?? undefined,
  }));

  res.status(200).json(results);
}
