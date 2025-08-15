// pages/api/billing/invoices.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getExternalId, getDbSubscription, stripe } from "./_shared";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  const external_id = getExternalId(req, res);
  if (!external_id) return res.status(200).json([]);

  const dbSub = await getDbSubscription(external_id);
  if (!dbSub?.stripe_customer_id) return res.status(200).json([]);

  const list = await stripe.invoices.list({ customer: dbSub.stripe_customer_id, limit: 20 });

  const results = list.data.map((inv) => ({
    id: inv.number ?? inv.id,
    date: inv.created ? new Date(inv.created * 1000).toISOString() : null,
    amount_pennies: inv.amount_due ?? 0,
    currency: (inv.currency || "gbp").toUpperCase(),
    status: (inv.status === "paid" ? "paid" : inv.status === "open" ? "due" : "failed") as
      | "paid"
      | "due"
      | "failed",
    pdf_url: inv.invoice_pdf || inv.hosted_invoice_url || undefined,
    period: {
      from: inv.period_start ? new Date(inv.period_start * 1000).toISOString() : undefined,
      to: inv.period_end ? new Date(inv.period_end * 1000).toISOString() : undefined,
    },
    description: inv.lines?.data?.[0]?.description ?? undefined,
  }));

  res.status(200).json({ results });
}
