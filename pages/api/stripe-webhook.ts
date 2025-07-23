// pages/api/stripe-webhook.ts
import { buffer } from "micro";
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma"; // Eğer başka ORM kullanıyorsan burayı uyarlarsın

export const config = {
  api: {
    bodyParser: false,
  },
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil", // veya senin projenin versiyonu
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).end("Method not allowed");
  }

  const buf = await buffer(req);
  const sig = req.headers["stripe-signature"] as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err: any) {
    console.error("❌ Webhook signature error:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const external_id = session.metadata?.external_id;
    const isTopup = session.metadata?.topup === "true";
    const amount = session.amount_total || 0;

    if (isTopup && external_id) {
      try {
        await prisma.wallet.upsert({
          where: { external_id },
          update: { balance_pennies: { increment: amount } },
          create: {
            external_id,
            balance_pennies: amount,
          },
        });
        console.log(`✅ Wallet updated: +£${amount / 100} for ${external_id}`);
      } catch (e) {
        console.error("❌ DB update error:", e);
      }
    }
  }

  res.json({ received: true });
}
