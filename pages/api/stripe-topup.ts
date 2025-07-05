import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";

export const config = {
  runtime: "nodejs",
};

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { amount, external_id } = req.body;

  if (!amount || !external_id) {
    return res.status(400).json({ error: "Missing amount or external_id" });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "gbp",
            unit_amount: Math.round(amount * 100), // amount in pennies
            product_data: {
              name: `Balance Top-Up (£${amount})`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        external_id,
        topup: "true",
      },
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?topup=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?topup=cancel`,
    });

    return res.status(200).json({ url: session.url });
  } catch (error: any) {
    console.error("❌ Stripe session creation failed:", error);
    return res.status(500).json({ error: "Stripe session creation failed" });
  }
}
