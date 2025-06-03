import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil", // ✅ Recommended stable version
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { couponCode } = req.body;

  if (!couponCode || typeof couponCode !== "string") {
    return res.status(400).json({ valid: false, error: "Missing or invalid coupon code" });
  }

  try {
    const promoList = await stripe.promotionCodes.list({
      code: couponCode.trim(),
      active: true,
    });

    const promo = promoList.data[0];

    if (!promo || !promo.coupon) {
      return res.status(200).json({ valid: false });
    }

    const coupon = promo.coupon;

    const discountAmount =
      coupon.amount_off != null
        ? coupon.amount_off / 100
        : coupon.percent_off != null
        ? coupon.percent_off
        : 0;

    return res.status(200).json({
      valid: true,
      discountAmount,
      couponId: coupon.id,
    });
  } catch (err: any) {
    console.error("Stripe validation error:", err.message);
    return res.status(200).json({ valid: false });
  }
}
