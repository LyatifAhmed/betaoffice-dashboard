import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil", // You may update this based on your compatibility
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { price_id, email, external_id } = req.body;

  // ✅ Check required fields
  if (!price_id || !email || !external_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // ✅ Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/kyc-submitted?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata: {
        external_id, // 💡 Used to match saved KYC form later
        price_id,    // Optional for record
      },
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe checkout session error:", err);
    return res.status(500).json({ error: "Stripe checkout session creation failed" });
  }
}
