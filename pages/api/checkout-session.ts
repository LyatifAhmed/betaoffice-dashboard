import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil", // ✅ Recommended: use stable version (no need "basil" unless you tested)
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { price_id, external_id, coupon_id, email } = req.body;

  if (!price_id || !external_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/kyc-submitted?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      billing_address_collection: "auto",
      customer_email: email,
      metadata: {
        external_id,
        stripe_price_id: price_id,
      },
    };

    if (coupon_id) {
      sessionParams.discounts = [{ coupon: coupon_id }];
    }

    const session = await stripe.checkout.sessions.create(sessionParams);
    return res.status(200).json({ sessionId: session.id });
  } catch (err: any) {
    console.error("❌ Stripe checkout session error:", err.message || err);
    return res.status(500).json({ error: "Stripe checkout session creation failed" });
  }
}
