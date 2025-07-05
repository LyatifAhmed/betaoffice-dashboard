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

  try {
    const [subscriptionRes, mailRes] = await Promise.all([
      axios.get(`${backendUrl}/subscription?external_id=${externalId}`),
      axios.get(`${backendUrl}/mail?external_id=${externalId}`),
    ]);

    const subscription = subscriptionRes.data;
    const now = new Date();

    const mailItems = (mailRes.data || []).map((item: any) => {
      const createdAt = new Date(item.created_at);
      const msSinceCreated = now.getTime() - createdAt.getTime();

      const is_expired = msSinceCreated > 24 * 60 * 60 * 1000; // 24 saat (PDF link)
      const can_forward = msSinceCreated <= 30 * 24 * 60 * 60 * 1000; // 30 gün

      return {
        ...item,
        is_expired,
        can_forward,
      };
    });

    const reviewStatus = subscription?.review_status;
    const stripeId =
      subscription?.stripe_subscription_id ||
      subscription?.subscription?.stripe_subscription_id ||
      null;

    console.log("📦 Subscription:", subscription);
    console.log("📬 Mail count:", mailItems?.length || 0);
    console.log("🧾 Review Status:", reviewStatus);
    console.log("💳 Stripe Subscription ID:", stripeId);

    if (reviewStatus !== "ACTIVE") {
      console.warn("🚫 Access denied — KYC not completed.");
      return res.status(403).json({ error: "Your identity verification is not complete." });
    }

    return res.status(200).json({
      subscription,
      mailItems,
      stripe_subscription_id: stripeId,
      _debug: {
        review_status: reviewStatus,
        stripe_id: stripeId,
      },
    });

  } catch (error: any) {
    console.error("❌ Backend fetch failed:", {
      message: error?.message,
      response: error?.response?.data,
      stack: error?.stack,
    });
    return res.status(500).json({ error: "Failed to fetch from backend" });
  }
}
