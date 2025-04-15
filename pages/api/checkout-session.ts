import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { priceId, email } = req.body;

  if (!priceId || !email) {
    return res.status(400).json({ error: "Missing priceId or email" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      customer_email: email, // ✅ Now passed to webhook
      metadata: {
        price_id: priceId,   // ✅ Needed for webhook lookup
      },
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe checkout session error:", err);
    return res.status(500).json({ error: "Stripe checkout session creation failed" });
  }
}

