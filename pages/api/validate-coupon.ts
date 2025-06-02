// pages/api/validate-coupon.ts
import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { code } = req.body;
  if (!code) return res.status(400).json({ error: "Coupon code is required" });

  try {
    const coupons = await stripe.coupons.list({ limit: 100 }); // or filter using metadata if needed
    const coupon = coupons.data.find(c => c.name?.toLowerCase() === code.toLowerCase());

    if (!coupon) return res.status(404).json({ error: "Coupon not found" });

    return res.status(200).json({ id: coupon.id, name: coupon.name, percent_off: coupon.percent_off });
  } catch (error) {
    console.error("Coupon validation failed", error);
    return res.status(500).json({ error: "Server error" });
  }
}

