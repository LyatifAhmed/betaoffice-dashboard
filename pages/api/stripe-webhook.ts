// pages/api/stripe-webhook.ts
import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";
import { randomUUID } from "crypto";

export const config = {
  api: { bodyParser: false },
};

// Stabil bir versiyon kullan (preview değil)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-07-30.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  let event: Stripe.Event;
  try {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"];
    if (!sig || typeof sig !== "string") {
      return res.status(400).send("Missing stripe-signature header");
    }
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err?.message || err);
    return res.status(400).send(`Webhook Error: ${err?.message || "invalid"}`);
  }

  try {
    const backendUrl = getBackendUrl();

    switch (event.type) {
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        const external_id = invoice?.metadata?.external_id as string | undefined;

        // Bazı tiplerde payment_intent null/obj/string olabilir → güvenli ayrıştır
        const pi = (invoice as any).payment_intent;
        const paymentIntentId =
          typeof pi === "string" ? pi : (pi?.id as string | undefined) || "";

        const lastError =
          (invoice as any)?.last_payment_error?.message ||
          (invoice?.status_transitions?.finalized_at ? "Payment failed" : "Unknown failure");

        console.warn(`⚠️ Payment failed for external_id: ${external_id || "unknown"}`);

        await prisma.failedPaymentAttempt.create({
          data: {
            external_id: external_id || "unknown",
            reason: lastError,
            payment_intent_id: paymentIntentId,
          },
        });

        // (Opsiyonel) backende haber ver (mail bildirimi vb.)
        await fetch(`${backendUrl}/notify-failed-payment`,
          withBasicAuth({
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              external_id: external_id || null,
              email: null, // İstersen burada Customer lookup yapıp doldurursun
            }),
          })
        );

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const external_id = invoice?.metadata?.external_id as string | undefined;
        if (!external_id) break;

        await prisma.subscriptions.updateMany({
          where: { external_id },
          data: { review_status: "ACTIVE" },
        });

        await prisma.failedPaymentAttempt.deleteMany({ where: { external_id } });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const external_id = (subscription?.metadata as any)?.external_id as string | undefined;
        if (!external_id) break;

        const attempts = await prisma.failedPaymentAttempt.findMany({ where: { external_id } });
        if (attempts.length >= 3) {
          // Aboneliği backend üzerinden durdur (politikana göre)
          await fetch(`${backendUrl}/subscription/${encodeURIComponent(external_id)}/stop`,
            withBasicAuth({
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({
                end_date: new Date().toISOString(),
                reason: "payment_failed",
              }),
            })
          );

          await prisma.subscriptions.updateMany({
            where: { external_id },
            data: { review_status: "CANCELLED" },
          });

          console.log(`❌ Subscription force-stopped for ${external_id}`);
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const external_id = session?.metadata?.external_id as string | undefined;
        const isTopup = session?.metadata?.topup === "true";
        const amount = session?.amount_total ?? 0;

        if (!external_id) break;

        if (isTopup) {
          // Cüzdanı güncelle (pennies). Prisma şeman id default’u yoksa id veriyoruz.
          await prisma.wallets.upsert({
            where: { external_id },
            update: { balance_pennies: { increment: amount } },
            create: {
              id: randomUUID(), // @default(uuid()) yoksa gereklidir; varsa da sorun olmaz
              external_id,
              balance_pennies: amount,
              created_at: new Date(),
              updated_at: new Date(),
            },
          });
          console.log(`💰 Top-up: £${(amount / 100).toFixed(2)} → ${external_id}`);
        } else {
          // Stripe ID’leri kaydet
          const customerId = typeof session.customer === "string" ? session.customer : undefined;
          const subscriptionId =
            typeof session.subscription === "string" ? session.subscription : undefined;

          await prisma.subscriptions.update({
            where: { external_id },
            data: {
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
            },
          });
          console.log(`✅ Saved Stripe IDs for ${external_id}`);
        }
        break;
      }

      default:
        // Diğer eventleri logla (gerekirse)
        console.log(`↪️ Unhandled event: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler failed:", err);
    return res.status(500).send("Internal server error");
  }
}
