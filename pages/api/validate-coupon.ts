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

  if (!couponCode) {
    return res.status(400).json({ valid: false });
  }

  try {
    const promotions = await stripe.promotionCodes.list({ active: true });
    const promo = promotions.data.find((p) => p.code === couponCode);

    if (promo) {
      return res.status(200).json({ valid: true, discountAmount: promo.coupon.amount_off ? promo.coupon.amount_off / 100 : 0 });
    } else {
      return res.status(200).json({ valid: false });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ valid: false });
  }
}
