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
  apiVersion: "2025-03-31.basil", // senin sürümün neyse onu kullan
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end("Method not allowed");
  }

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
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const external_id = session.metadata?.external_id;
        const isTopup = session.metadata?.topup === "true";
        const amount = session.amount_total ?? 0;

        if (!external_id) {
          console.warn("⚠️ Missing external_id in metadata");
          break;
        }

        if (isTopup) {
          await prisma.wallet.upsert({
            where: { external_id },
            update: { balance_pennies: { increment: amount } },
            create: { external_id, balance_pennies: amount },
          });
          console.log(`💰 Wallet top-up: +£${amount / 100} for ${external_id}`);
        } else {
          console.log("ℹ️ Checkout completed, but not a top-up session.");
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        const external_id = invoice.metadata?.external_id;

        if (!external_id) {
          console.warn("⚠️ Missing external_id in invoice metadata");
          break;
        }

        await prisma.subscription.updateMany({
          where: { external_id },
          data: { review_status: "ACTIVE" }, // Veya kendi kullandığın alan
        });

        console.log(`✅ Subscription payment succeeded — activated for ${external_id}`);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const external_id = subscription.metadata?.external_id;

        if (!external_id) {
          console.warn("⚠️ Missing external_id in subscription metadata");
          break;
        }

        await prisma.subscription.updateMany({
          where: { external_id },
          data: { review_status: "CANCELLED" },
        });

        console.log(`❌ Subscription cancelled for ${external_id}`);
        break;
      }

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler failed:", err);
    res.status(500).send("Internal server error");
  }
}
