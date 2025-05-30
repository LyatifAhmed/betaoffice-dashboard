import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2025-03-31.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false, error: 'No code provided' });
  }

  try {
    const promo = await stripe.promotionCodes.list({
      code,
      active: true,
      limit: 1,
    });

    const isValid = promo.data.length > 0;
    return res.status(200).json({ valid: isValid });
  } catch (err) {
    console.error('❌ Coupon validation failed:', err);
    return res.status(500).json({ valid: false, error: 'Server error' });
  }
}