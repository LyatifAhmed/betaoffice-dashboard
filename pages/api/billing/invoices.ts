// pages/api/billing/invoices.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripe";
import { loadCompanyByExternalId, pickStripeCustomer } from "@/lib/subscription-helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { external_id, company } = await loadCompanyByExternalId(req);
    if (!external_id || !company) return res.status(200).json([]);

    const customerId = pickStripeCustomer(company);
    if (!customerId) return res.status(200).json([]);

    const invs = await stripe.invoices.list({ customer: customerId, limit: 30 });
    const rows = invs.data.map((i) => ({
      id: i.id,
      date: i.created ? new Date(i.created * 1000).toISOString() : null,
      amount_pennies: i.amount_due ?? 0,
      currency: (i.currency || "gbp").toUpperCase(),
      status: i.status === "paid" ? "paid" : i.status === "open" ? "due" : "failed",
      pdf_url: i.invoice_pdf || undefined,
      period: {
        from: i.period_start ? new Date(i.period_start * 1000).toISOString() : undefined,
        to: i.period_end ? new Date(i.period_end * 1000).toISOString() : undefined,
      },
      description: i.description || undefined,
    }));

    res.status(200).json(rows);
  } catch (e: any) {
    console.error("invoices.ts error:", e?.message || e);
    res.status(500).json({ error: "Failed to load invoices" });
  }
}
