// pages/api/billing/payment-methods.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { stripe } from "@/lib/stripe";
import { loadCompanyByExternalId, pickStripeCustomer } from "@/lib/subscription-helpers";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { external_id, company } = await loadCompanyByExternalId(req);
    if (!external_id || !company) return res.status(200).json([]);

    const customerId = pickStripeCustomer(company);
    if (!customerId) return res.status(200).json([]);

    const pms = await stripe.paymentMethods.list({ customer: customerId, type: "card" });

    // default PM:
    const cust = await stripe.customers.retrieve(customerId);
    const defaultPmId = (cust as any)?.invoice_settings?.default_payment_method || null;

    const rows = pms.data.map(pm => ({
      id: pm.id,
      brand: pm.card?.brand || "card",
      last4: pm.card?.last4 || "0000",
      exp_month: pm.card?.exp_month || 1,
      exp_year: pm.card?.exp_year || 2099,
      is_default: pm.id === defaultPmId,
    }));

    res.status(200).json(rows);
  } catch (e: any) {
    console.error("payment-methods.ts error:", e?.message || e);
    res.status(500).json({ error: "Failed to load payment methods" });
  }
}
