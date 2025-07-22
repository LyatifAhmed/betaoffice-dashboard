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

  if (!externalId) {
    return res.status(401).json({ error: "Not authenticated. Missing external_id cookie." });
  }

  const backendUrl = process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL;
  const backendUser = process.env.NEXT_PUBLIC_API_USER;
  const backendPass = process.env.NEXT_PUBLIC_API_PASS;

  if (!backendUrl || !backendUser || !backendPass) {
    return res.status(500).json({ error: "Backend credentials missing" });
  }

  try {
    const auth = { username: backendUser, password: backendPass };

    const [subscriptionRes, mailRes] = await Promise.all([
      axios.get(`${backendUrl}/subscription?external_id=${externalId}`, { auth }),
      axios.get(`${backendUrl}/mail?external_id=${externalId}`, { auth }),
    ]);

    const subscription = subscriptionRes.data;
    const now = new Date();

    const mailItems = (mailRes.data || []).map((item: any) => {
      const createdAt = new Date(item.created_at);
      const msSinceCreated = now.getTime() - createdAt.getTime();

      return {
        ...item,
        is_expired: msSinceCreated > 24 * 60 * 60 * 1000, // 24 saat
        can_forward: msSinceCreated <= 30 * 24 * 60 * 60 * 1000, // 30 gün
      };
    });

    const reviewStatus = subscription?.review_status;
    const stripeId = subscription?.stripe_subscription_id ?? null;

    if (reviewStatus !== "ACTIVE") {
      return res.status(403).json({ error: "Your identity verification is not complete." });
    }

    return res.status(200).json({
      subscription,
      mailItems,
      stripe_subscription_id: stripeId,
    });

  } catch (error: any) {
    console.error("❌ Backend fetch failed:", {
      message: error?.message,
      response: error?.response?.data,
    });
    return res.status(500).json({ error: "Failed to fetch from backend" });
  }
}
