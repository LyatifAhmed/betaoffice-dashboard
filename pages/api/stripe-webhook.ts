// pages/api/stripe-webhook.ts
import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma"; // adjust if you're using another ORM

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);


const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const external_id = session.metadata?.external_id;
    const topup = session.metadata?.topup === "true";
    const amount = session.amount_total ?? 0;

    if (topup && external_id) {
      try {
        await prisma.wallet.upsert({
          where: { external_id },
          update: {
            balance_pennies: {
              increment: amount,
            },
          },
          create: {
            external_id,
            balance_pennies: amount,
          },
        });

        console.log(`💰 Balance updated for ${external_id}: +£${amount / 100}`);
      } catch (error) {
        console.error("❌ Failed to update wallet:", error);
      }
    }
  }

  res.json({ received: true });
}
