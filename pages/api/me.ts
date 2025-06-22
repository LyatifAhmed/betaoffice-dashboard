import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { parse } from "cookie";

export const config = {
  runtime: "nodejs",
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieHeader = req.headers.cookie || "";
  const parsedCookies = parse(cookieHeader);
  const externalId = parsedCookies.external_id;

  console.log("🍪 Parsed external_id in /api/me:", externalId);

  if (!externalId) {
    console.warn("⚠️ Missing external_id in cookie.");
    return res.status(401).json({ error: "Not authenticated. Missing external_id cookie." });
  }

  const backendUrl = process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL;
  if (!backendUrl) {
    console.error("❌ Missing NEXT_PUBLIC_HOXTON_API_BACKEND_URL in env.");
    return res.status(500).json({ error: "Missing backend URL" });
  }

  console.log(`🌐 Fetching from backend: ${backendUrl}`);

  try {
    const [subscriptionRes, mailRes] = await Promise.all([
      axios.get(`${backendUrl}/subscription?external_id=${externalId}`),
      axios.get(`${backendUrl}/mail?external_id=${externalId}`),
    ]);

    const subscription = subscriptionRes.data;
    const mailItems = mailRes.data;

    console.log("📦 Subscription response:", subscription);
    console.log("📫 Mail items:", mailItems?.length || 0);
    console.log("🧾 Subscription status:", subscription?.status);
    console.log("🔍 Review status:", subscription?.review_status);
    console.log("💳 Stripe subscription ID:", subscription?.stripe_subscription_id);

    if (subscription?.status === "CANCELLED") {
      console.warn("🚫 Access denied — subscription is CANCELLED.");
      return res.status(403).json({ error: "Your account has been cancelled." });
    }

    return res.status(200).json({
      subscription,
      mailItems,
      stripe_subscription_id: subscription?.stripe_subscription_id || null,
      _debug: {
        status: subscription?.status,
        review_status: subscription?.review_status,
        stripe_id: subscription?.stripe_subscription_id,
        full_response: subscription,
      },
    });

  } catch (error: any) {
    console.error("❌ Backend fetch failed:", error?.response?.data || error.message);
    return res.status(500).json({ error: "Failed to fetch from backend" });
  }
}
