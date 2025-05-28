import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { couponCode } = req.body;

  if (!couponCode || typeof couponCode !== "string") {
    return res.status(400).json({ valid: false });
  }

  try {
    const promotions = await stripe.promotionCodes.list({ active: true, limit: 100 });

    const promo = promotions.data.find(
      (p) => p.code.toLowerCase() === couponCode.toLowerCase()
    );

    if (promo && promo.coupon.valid) {
      const discountAmount = promo.coupon.amount_off
        ? promo.coupon.amount_off / 100
        : 0;

      return res.status(200).json({
        valid: true,
        discountAmount,
        couponId: promo.coupon.id, // ✅ pass Stripe coupon ID for /checkout-session
      });
    }

    return res.status(200).json({ valid: false });
  } catch (error) {
    console.error("❌ Error validating coupon:", error);
    return res.status(500).json({ valid: false });
  }
}
