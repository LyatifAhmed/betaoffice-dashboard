import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { parse } from "cookie";

export const config = {
  runtime: "nodejs", // ✅ Vercel'de Edge yerine Node.js çalışsın
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookieHeader = req.headers.cookie || "";
  const parsedCookies = parse(cookieHeader);
  const externalId = parsedCookies.external_id;

  if (!externalId) {
    return res.status(401).json({ error: "Not authenticated. Missing external_id cookie." });
  }

  try {
    const [subscriptionRes, mailRes] = await Promise.all([
      axios.get(`${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/subscription?external_id=${externalId}`),
      axios.get(`${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/mail?external_id=${externalId}`)
    ]);

    return res.status(200).json({
      subscription: subscriptionRes.data,
      mailItems: mailRes.data
    });
  } catch (error: any) {
    console.error("Fetch failed:", error?.response?.data || error.message);
    return res.status(500).json({ error: "Failed to load subscription or mail data" });
  }
}

