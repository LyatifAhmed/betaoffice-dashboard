import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import axios from "axios";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-07-30.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { external_id, stripe_subscription_id } = req.body;

  if (!external_id || !stripe_subscription_id) {
    console.error("❌ Missing required fields:", { external_id, stripe_subscription_id });
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // ✅ 1. Stripe üzerinden aboneliği dönem sonunda iptal et
    console.log("🔁 Cancelling Stripe subscription at period end...");
    await stripe.subscriptions.update(stripe_subscription_id, {
      cancel_at_period_end: true,
    });
    console.log("✅ Stripe cancellation scheduled");

    // ✅ 2. FastAPI backend'e haber ver
    const backendUrl = process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL;
    if (!backendUrl) {
      console.error("❌ Backend URL not configured");
      return res.status(500).json({ error: "Missing backend URL" });
    }

    console.log("📡 Notifying backend to cancel Hoxton subscription...");
    const response = await axios.post(`${backendUrl}/cancel-subscription`, { external_id });

    if (response.status === 200) {
      console.log("✅ Backend acknowledged cancellation");
      return res.status(200).json({ success: true });
    } else {
      console.error("⚠️ Unexpected backend response:", response.status);
      return res.status(500).json({ error: "Unexpected response from backend" });
    }

  } catch (err: any) {
    console.error("❌ Cancel error:", err?.response?.data || err.message || err);
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
}
