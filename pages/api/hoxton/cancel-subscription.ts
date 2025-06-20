import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import axios from "axios";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-03-31.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { external_id, stripe_subscription_id } = req.body;

  if (!external_id || typeof external_id !== "string") {
    return res.status(400).json({ error: "Missing or invalid external_id" });
  }

  if (!stripe_subscription_id || typeof stripe_subscription_id !== "string") {
    return res.status(400).json({ error: "Missing or invalid stripe_subscription_id" });
  }

  try {
    // 1. Cancel Stripe subscription at end of billing period
    const stripeRes = await stripe.subscriptions.update(stripe_subscription_id, {
      cancel_at_period_end: true,
    });

    console.log(`Stripe subscription marked for cancellation at period end: ${stripeRes.id}`);

    // 2. Notify FastAPI backend (which will notify Hoxton Mix at correct time)
    const backendUrl = process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL;
    await axios.post(`${backendUrl}/cancel-subscription`, { external_id });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Cancel error:", err?.response?.data || err.message || err);
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
}
