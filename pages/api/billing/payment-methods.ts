// pages/api/billing/payment-methods.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getExternalId, getDbSubscription, stripe } from "./_shared";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  const external_id = getExternalId(req, res);
  if (!external_id) return res.status(200).json([]);

  const dbSub = await getDbSubscription(external_id);
  if (!dbSub?.stripe_customer_id) return res.status(200).json([]);

  const pms = await stripe.paymentMethods.list({
    customer: dbSub.stripe_customer_id,
    type: "card",
  });

  // default source / invoice settings’ten belirle
  const cust = await stripe.customers.retrieve(dbSub.stripe_customer_id);
  const defaultPmId =
    (cust as any)?.invoice_settings?.default_payment_method ||
    (typeof (cust as any).default_source === "string" ? (cust as any).default_source : null);

  const results = pms.data.map((pm) => ({
    id: pm.id,
    brand: pm.card?.brand ?? "card",
    last4: pm.card?.last4 ?? "••••",
    exp_month: pm.card?.exp_month ?? 0,
    exp_year: pm.card?.exp_year ?? 0,
    is_default: pm.id === defaultPmId,
  }));

  res.status(200).json({ results });
}
