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

  const hoxtonApiBase = process.env.HOXTON_API_BASE_URL;
  const hoxtonApiKey = process.env.HOXTON_API_KEY;

  if (!hoxtonApiBase || !hoxtonApiKey) {
    return res.status(500).json({ error: "Missing Hoxton API config" });
  }

  try {
    const authHeader = {
      auth: {
        username: hoxtonApiKey,
        password: "", // Basic Auth only needs username (API key), password is empty
      },
    };

    const [subscriptionRes, mailRes] = await Promise.all([
      axios.get(`${hoxtonApiBase}/subscription/${externalId}`, authHeader),
      axios.get(`${hoxtonApiBase}/subscription/${externalId}/mail`, authHeader),
    ]);

    return res.status(200).json({
      subscription: subscriptionRes.data,
      mailItems: mailRes.data,
    });
  } catch (error: any) {
    console.error("Hoxton API fetch failed:", error?.response?.data || error.message);
    return res.status(500).json({ error: "Failed to load subscription or mail data from Hoxton API" });
  }
}
