import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { price_id, email, external_id, couponCode } = req.body;

  if (!price_id || !email || !external_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const params: Stripe.Checkout.SessionCreateParams = {
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [{ price: price_id, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/kyc-submitted?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata: { external_id, price_id },
    };

    // 🎯 Attach coupon discount if valid
    if (couponCode) {
      try {
        const promotionCodeId = await findPromotionCodeId(couponCode);
        params.discounts = [{ promotion_code: promotionCodeId }];
      } catch (error) {
        console.warn("Invalid or expired coupon code:", couponCode);
        // Optional: You can continue without discount if coupon invalid
      }
    }

    const session = await stripe.checkout.sessions.create(params);
    return res.status(200).json({ sessionId: session.id });
  } catch (err) {
    console.error("Stripe checkout session error:", err);
    return res.status(500).json({ error: "Stripe checkout session creation failed" });
  }
}

// ✅ Helper function to find promotion code ID
async function findPromotionCodeId(code: string): Promise<string> {
  const promotions = await stripe.promotionCodes.list({ active: true });
  const promo = promotions.data.find((p) => p.code === code);

  if (!promo) {
    throw new Error("Promotion code not found");
  }

  return promo.id;
}
