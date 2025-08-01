import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { parse } from "cookie";
import { applyCategories } from "@/lib/applyCategories";

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
  const apiUser = process.env.NEXT_PUBLIC_API_USER;
  const apiPass = process.env.NEXT_PUBLIC_API_PASS;

  if (!backendUrl || !apiUser || !apiPass) {
    console.error("❌ Missing required environment variables.");
    return res.status(500).json({ error: "Missing backend URL or credentials" });
  }

  try {
    // Fetch subscription
    const subscriptionRes = await axios.get(`${backendUrl}/subscription?external_id=${externalId}`, {
      auth: { username: apiUser, password: apiPass },
    });

    const subscription = subscriptionRes.data;

    if (subscription.review_status === "NO_ID" && subscription.cancel_at_period_end === true) {
      return res.status(403).json({
        error: "Your registration was cancelled before ID verification. Please reapply.",
      });
    }

    // Fetch mail items
    let mailItems: any[] = [];
    let page = 1;
    let hasNext = true;

    while (hasNext) {
      const mailRes = await axios.get(
        `${backendUrl}/mail?external_id=${externalId}&page=${page}&page_size=50`,
        { auth: { username: apiUser, password: apiPass } }
      );

      const pageData = mailRes.data;
      mailItems.push(...(pageData.results || []));
      hasNext = !!pageData.next;
      page++;
    }

    // AI kategorilendirme + expiration kontrolü
    const now = new Date();
    const categorizedItems = await applyCategories(mailItems);

    const processedMailItems = categorizedItems.map((item: any) => {
      const createdAt = new Date(item.created_at);
      const msSinceCreated = now.getTime() - createdAt.getTime();

      return {
        ...item,
        is_expired: msSinceCreated > 24 * 60 * 60 * 1000,
        can_forward: msSinceCreated <= 30 * 24 * 60 * 60 * 1000,
      };
    });

    const stripeId =
      subscription?.stripe_subscription_id ||
      subscription?.subscription?.stripe_subscription_id ||
      null;

    return res.status(200).json({
      subscription: {
        ...subscription,
        wallet_balance: subscription.wallet_balance ?? 0,
      },
      mailItems: processedMailItems,
      stripe_subscription_id: stripeId,
      _debug: {
        review_status: subscription.review_status,
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
