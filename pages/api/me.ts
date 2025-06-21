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
  if (!backendUrl) {
    return res.status(500).json({ error: "Missing backend URL" });
  }

  try {
    // Get subscription and mail from your FastAPI backend
    const [subscriptionRes, mailRes] = await Promise.all([
      axios.get(`${backendUrl}/subscription?external_id=${externalId}`),
      axios.get(`${backendUrl}/mail?external_id=${externalId}`),
    ]);

    const subscription = subscriptionRes.data;
    console.log("DEBUG: Hoxton Subscription Response:", subscription);


    // ❗ Müşteri sadece CANCELLED durumundaysa giriş reddedilsin
    if (subscription?.status === "CANCELLED") {
      return res.status(403).json({ error: "Your account has been cancelled." });
    }

    return res.status(200).json({
      subscription,
      mailItems: mailRes.data,
      stripe_subscription_id: subscription?.stripe_subscription_id || null,
    });
  } catch (error: any) {
    console.error("Backend fetch failed:", error?.response?.data || error.message);
    return res.status(500).json({ error: "Failed to fetch from backend" });
  }
}
