import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import axios from "axios";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-03-31.basil',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { priceId, email, planName, token } = req.body;

if (!priceId || !email || !planName || !token) {
  return res.status(400).json({ error: "Missing required fields" });
}

  try {
    // Step 1: Call FastAPI backend first to create token
    const response = await axios.post('https://hoxton-api-backend.onrender.com/api/create-token', {
      email,
      product_id: priceId === "price_1RBKvBACVQjWBIYus7IRSyEt" ? 2736 : 2737,
      plan_name: planName
    });

    const { token } = response.data;

    // Step 2: Now create the checkout session with the token in success URL
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/kyc?token=${token}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
    });

    return res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error("Checkout error:", err);
    return res.status(500).json({ error: "Checkout session creation failed" });
  }
}

