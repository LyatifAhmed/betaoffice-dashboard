// pages/api/stripe-webhook.ts
import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

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
    switch (event.type) {
      case "invoice.payment_failed": {
        const invoice = event.data.object as any; // <== as any ile type genişletildi
        const external_id = invoice.metadata?.external_id;
        const customer = invoice.customer;

        let customerEmail = "";
        if (typeof customer === "object" && customer?.email) {
          customerEmail = customer.email;
        }

        const paymentIntentId = invoice.payment_intent;
        const lastError = invoice?.last_payment_error?.message || "Unknown failure";

        console.warn(`⚠️ Payment failed for external_id: ${external_id}`);

        await prisma.failedPaymentAttempt.create({
          data: {
            external_id: external_id || "unknown",
            reason: lastError,
            payment_intent_id: paymentIntentId || "",
          },
        });

        await fetch(`${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/notify-failed-payment`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(
              `${process.env.NEXT_PUBLIC_API_USER}:${process.env.NEXT_PUBLIC_API_PASS}`
            ).toString("base64")}`,
          },
          body: JSON.stringify({ external_id, email: customerEmail }),
        });

        break;
      }


      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const external_id = invoice.metadata?.external_id;
        if (!external_id) break;

        await prisma.subscription.updateMany({
          where: { external_id },
          data: { review_status: "ACTIVE" },
        });

        await prisma.failedPaymentAttempt.deleteMany({ where: { external_id } });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const external_id = subscription.metadata?.external_id;
        if (!external_id) break;

        // retry count kontrolü
        const attempts = await prisma.failedPaymentAttempt.findMany({
          where: { external_id },
        });

        if (attempts.length >= 3) {
          await fetch(`${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/api/v2/subscription/${external_id}/stop/${new Date().toISOString()}/payment_failed`, {
            method: "POST",
            headers: {
              Authorization: `Basic ${Buffer.from(
                `${process.env.NEXT_PUBLIC_API_USER}:${process.env.NEXT_PUBLIC_API_PASS}`
              ).toString("base64")}`,
            },
          });

          await prisma.subscription.updateMany({
            where: { external_id },
            data: { review_status: "CANCELLED" },
          });

          console.log(`❌ Subscription force-stopped via Hoxton for ${external_id}`);
        }
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const external_id = session.metadata?.external_id;
        const isTopup = session.metadata?.topup === "true";
        const amount = session.amount_total ?? 0;
        if (!external_id) break;

        if (isTopup) {
          await prisma.wallet.upsert({
            where: { external_id },
            update: { balance_pennies: { increment: amount } },
            create: { external_id, balance_pennies: amount },
          });
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
