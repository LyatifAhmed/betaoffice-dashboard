// pages/api/hoxton/cancel-subscription.ts
import type { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // production'da sabit/stable bir versiyon önerilir:
  apiVersion: "2025-07-30.basil",
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { external_id, stripe_subscription_id } = req.body || {};
  if (!external_id || !stripe_subscription_id) {
    console.error("❌ Missing required fields:", { external_id, stripe_subscription_id });
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // 1) Stripe: dönem sonunda iptal
    console.log("🔁 Cancelling Stripe subscription at period end…");
    await stripe.subscriptions.update(stripe_subscription_id, { cancel_at_period_end: true });
    console.log("✅ Stripe cancellation scheduled");

    // 2) Backend’e haber ver (Hoxton tarafını da durdursun)
    const backendUrl = getBackendUrl();
    console.log("📡 Notifying backend to cancel Hoxton subscription…");

    const r = await fetch(`${backendUrl}/cancel-subscription`,
      withBasicAuth({
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ external_id }),
      })
    );

    if (!r.ok) {
      const text = await r.text();
      console.error("⚠️ Backend cancel failed:", r.status, text);
      return res.status(502).json({ error: "Backend cancel failed", detail: text });
    }

    console.log("✅ Backend acknowledged cancellation");
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("❌ Cancel error:", err?.response?.data || err?.message || err);
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
}
