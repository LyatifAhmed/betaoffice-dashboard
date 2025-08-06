import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../lib/auth";
import axios from "axios";
import { serialize } from "cookie";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Missing token" });

  const email = verifyToken(token);
  if (!email) return res.status(401).json({ error: "Invalid or expired token" });

  try {
    const HOXTON_API_URL = process.env.HOXTON_API_URL!;
    const HOXTON_API_USER = process.env.BASIC_AUTH_USER!;
    const HOXTON_API_PASS = process.env.BASIC_AUTH_PASS!;

    const response = await axios.get(
      `${HOXTON_API_URL}/customer?email=${encodeURIComponent(email)}`,
      {
        auth: {
          username: HOXTON_API_USER,
          password: HOXTON_API_PASS,
        },
      }
    );

    const externalId = response?.data?.external_id;
    if (!externalId) {
      console.error("❌ No external_id found for email:", email);
      return res.status(404).json({ error: "User not found in Hoxton API" });
    }

    res.setHeader(
      "Set-Cookie",
      serialize("external_id", externalId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      })
    );

    console.log(`✅ Verified: ${email} → ${externalId}`);
    return res.status(200).json({ email, external_id: externalId });
  } catch (err: any) {
    console.error("❌ Lookup failed:", JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
    return res.status(500).json({ error: "Failed to retrieve customer data" });
  }
}
