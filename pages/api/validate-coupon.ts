import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil", // or latest stable
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { couponCode } = req.body; // make sure this matches your frontend

  if (!couponCode) {
    return res.status(400).json({ valid: false, error: "Missing coupon code" });
  }

  try {
    const coupon = await stripe.coupons.retrieve(couponCode);

    if (!coupon || coupon.valid === false) {
      return res.status(200).json({ valid: false });
    }

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
    console.error("Stripe error:", err.message);
    return res.status(200).json({ valid: false });
  }
}

