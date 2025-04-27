import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil", // ✅ Recommended: use stable version (no need "basil" unless you tested)
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
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/kyc-submitted?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/cancel`,
      metadata: { external_id, price_id },
    };

    // ✅ Attach coupon if provided
    if (couponCode && couponCode.trim() !== "") {
      const promotionCodeId = await findPromotionCodeId(couponCode.trim().toUpperCase());
      if (promotionCodeId) {
        params.discounts = [{ promotion_code: promotionCodeId }];
      } else {
        console.warn(`⚠️ Coupon code ${couponCode} was not found or inactive.`);
      }
    }

    const session = await stripe.checkout.sessions.create(params);

    return res.status(200).json({ sessionId: session.id });
  } catch (err: any) {
    console.error("Stripe checkout session error:", err.message || err);
    return res.status(500).json({ error: "Stripe checkout session creation failed" });
  }
}

// ✅ Helper to find the Promotion Code ID
async function findPromotionCodeId(code: string): Promise<string | null> {
  const promotions = await stripe.promotionCodes.list({ active: true, limit: 100 });

  const promo = promotions.data.find((p) => p.code.toUpperCase() === code);

  if (!promo) {
    return null; // No matching promo code found
  }

  return promo.id;
}
