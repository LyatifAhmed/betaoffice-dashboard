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
  apiVersion: "2025-03-31.basil", // Versiyonunu gerektiği gibi ayarla
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
            create: {
              external_id,
              balance_pennies: amount,
            },
          });
          console.log(`✅ Wallet updated: +£${amount / 100} for ${external_id}`);
        } else {
          console.log("ℹ️ Not a top-up session. Ignoring.");
        }
        break;
      }

      // 🎯 Gelecekte ekleyebilirsin:
      // case "invoice.payment_succeeded":
      // case "customer.subscription.created":

      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (err) {
    console.error("❌ Webhook handler error:", err);
    res.status(500).send("Internal server error");
  }
}

