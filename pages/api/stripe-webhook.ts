// pages/api/stripe-webhook.ts
import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  // Preview yerine stabil bir versiyona pinlemek daha güvenli
  apiVersion: "2025-07-30.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  let event: Stripe.Event;
  try {
    const buf = await buffer(req);
    const sig = req.headers["stripe-signature"] as string;
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err: any) {
    console.error("❌ Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    const backendUrl = getBackendUrl();

    switch (event.type) {
      case "invoice.payment_failed": {
        const invoice = event.data.object as any;
        const external_id = invoice?.metadata?.external_id as string | undefined;
        const customer = invoice?.customer as Stripe.Customer | string | undefined;

        let customerEmail = "";
        if (customer && typeof customer === "object" && "email" in customer && customer.email) {
          customerEmail = String(customer.email);
        }

        const paymentIntentId = invoice?.payment_intent ?? "";
        const lastError = invoice?.last_payment_error?.message || "Unknown failure";

        console.warn(`⚠️ Payment failed for external_id: ${external_id}`);

        // DB’de kaydet
        await prisma.failedPaymentAttempt.create({
          data: {
            external_id: external_id || "unknown",
            reason: lastError,
            payment_intent_id: String(paymentIntentId || ""),
          },
        });

        // Backend’e bildir (mail gönderimi vb.)
        await fetch(`${backendUrl}/notify-failed-payment`,
          withBasicAuth({
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ external_id, email: customerEmail }),
          })
        );

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const external_id = invoice?.metadata?.external_id as string | undefined;
        if (!external_id) break;

        // Status ACTIVE yap
        await prisma.subscription.updateMany({
          where: { external_id },
          data: { review_status: "ACTIVE" },
        });

        // Eski failed kayıtlarını temizle
        await prisma.failedPaymentAttempt.deleteMany({ where: { external_id } });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const external_id = (subscription?.metadata as any)?.external_id as string | undefined;
        if (!external_id) break;

        const attempts = await prisma.failedPaymentAttempt.findMany({ where: { external_id } });

        if (attempts.length >= 3) {
          // Yeni backend rotasına göre: POST /subscription/{external_id}/stop  body: { end_date, reason }
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

          await prisma.subscription.updateMany({
            where: { external_id },
            data: { review_status: "CANCELLED" },
          });

          console.log(`❌ Subscription force-stopped via backend for ${external_id}`);
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
          // Cüzdanı güncelle (pennies)
          try {
            await prisma.wallet.upsert({
              where: { external_id },
              update: { balance_pennies: { increment: amount } },
              create: { external_id, balance_pennies: amount },
            });
            console.log(`💰 Top-up succeeded for ${external_id}: £${(amount / 100).toFixed(2)}`);
          } catch (err) {
            console.error(`❌ Wallet update failed for ${external_id}:`, err);
          }
        } else {
          // Stripe IDs’i kendi DB’ne yaz
          const customerId = typeof session.customer === "string" ? session.customer : null;
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
          console.log(`🧾 Saving Stripe IDs for ${external_id}: customer=${customerId}, subscription=${subscriptionId}`);

          try {
            await prisma.subscription.update({
              where: { external_id },
              data: {
                stripe_customer_id: customerId || undefined,
                stripe_subscription_id: subscriptionId || undefined,
              },
            });
            console.log(`✅ Stripe customer and subscription saved for ${external_id}`);
          } catch (err) {
            console.error(`❌ Failed to update subscription IDs for ${external_id}:`, err);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler failed:", err);
    res.status(500).send("Internal server error");
  }
}
