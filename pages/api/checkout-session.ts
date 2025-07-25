import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil", // ✅ Stable recommended
});

type CheckoutRequestBody = {
  price_id: string;
  external_id: string;
  coupon_id?: string | null;
  email: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { price_id, external_id, coupon_id, email } = req.body as CheckoutRequestBody;

  if (!price_id || !external_id || !email) {
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

    // ✅ Only include the discount if coupon_id is valid
    if (coupon_id && typeof coupon_id === "string" && coupon_id.trim() !== "") {
      sessionParams.discounts = [{ coupon: coupon_id }];
    }


    const session = await stripe.checkout.sessions.create(sessionParams);

    return res.status(200).json({ sessionId: session.id });
  } catch (err: any) {
    console.error("❌ Stripe Checkout Error:", err.message);
    return res.status(500).json({ error: "Failed to create Stripe checkout session" });
  }
}
