// /pages/api/billing/address.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { ensureStripeCustomer, getExternalId, stripe, toStripeCustomerUpdate, toUiAddress } from "./_shared";

/**
 * GET  -> Stripe Customer'dan faturada görünecek adresi getirir
 * POST -> Stripe Customer'ı günceller ve (opsiyonel) default payment method'u ayarlar
 *
 * Body örneği:
 *  {
 *    "address": {
 *      "name":"John Doe","company":"Acme Ltd",
 *      "line1":"86-90 Paul Street","city":"London","postal_code":"EC2A 4NE","country":"GB",
 *      "email":"john@acme.com","phone":"+44..."
 *    },
 *    "default_payment_method": "pm_123" // opsiyonel
 *  }
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const externalId = getExternalId(req, res);
  if (!externalId) return;

  try {
    if (req.method === "GET") {
      const customer = await ensureStripeCustomer(externalId);
      // invoice_settings.default_payment_method'i genişletmek istersen yeniden çek:
      const c = await stripe.customers.retrieve(customer.id, {
        expand: ["invoice_settings.default_payment_method"],
      });
      res.status(200).json({
        address: toUiAddress(c as any),
        customer_id: (c as any).id,
        default_payment_method: (c as any).invoice_settings?.default_payment_method?.id ?? null,
        custom_fields: (c as any).invoice_settings?.custom_fields ?? null,
      });
      return;
    }

    if (req.method === "POST") {
      const { address, default_payment_method }: { address?: any; default_payment_method?: string | null } = req.body || {};
      if (!address || typeof address !== "object") {
        res.status(400).json({ error: "address payload missing" });
        return;
      }

      const customer = await ensureStripeCustomer(externalId);

      // 1) Customer alanlarını güncelle
      const updatePayload = toStripeCustomerUpdate(address);
      // default PM istenirse invoice_settings ile birlikte set edelim
      if (default_payment_method) {
        updatePayload.invoice_settings = {
          ...(updatePayload.invoice_settings || {}),
          default_payment_method,
        };
      }

      await stripe.customers.update(customer.id, updatePayload);

      // 2) Son durumu döndür
      const updated = await stripe.customers.retrieve(customer.id, {
        expand: ["invoice_settings.default_payment_method"],
      });

      res.status(200).json({
        ok: true,
        address: toUiAddress(updated as any),
        customer_id: (updated as any).id,
        default_payment_method: (updated as any).invoice_settings?.default_payment_method?.id ?? null,
        custom_fields: (updated as any).invoice_settings?.custom_fields ?? null,
      });
      return;
    }

    res.setHeader("Allow", "GET, POST");
    res.status(405).json({ error: "Method not allowed" });
  } catch (e: any) {
    console.error("billing/address error:", e);
    res.status(500).json({ error: e?.message ?? "Internal error" });
  }
}
