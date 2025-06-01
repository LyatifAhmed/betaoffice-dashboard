import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { coupon_code } = req.body;

  if (!coupon_code) {
    return res.status(400).json({ error: "Coupon code is required" });
  }

  try {
    const coupon = await stripe.coupons.retrieve(coupon_code.toLowerCase());

    if (!coupon.valid) {
      return res.status(400).json({ error: "Coupon is invalid or expired" });
    }

    return res.status(200).json({ valid: true, amount_off: coupon.amount_off, percent_off: coupon.percent_off });
  } catch (err) {
    console.error("Coupon validation failed:", err);
    return res.status(400).json({ error: "Invalid coupon" });
  }
}
