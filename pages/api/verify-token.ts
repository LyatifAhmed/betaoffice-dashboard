// pages/api/verify-token.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "../../lib/auth";
import { serialize } from "cookie";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { token } = req.body || {};
  if (!token) return res.status(400).json({ error: "Missing token" });

  const email = verifyToken(token);
  if (!email) return res.status(401).json({ error: "Invalid or expired token" });

  try {
    const backend = getBackendUrl();

    // Backend: GET /customer?email=...
    const r = await fetch(
      `${backend}/customer?email=${encodeURIComponent(email)}`,
      withBasicAuth({ headers: { accept: "application/json" } })
    );

    if (!r.ok) {
      const msg = await r.text();
      console.error("❌ Lookup failed:", r.status, msg);
      return res.status(r.status).json({ error: "Failed to retrieve customer data" });
    }

    const data = await r.json();
    const externalId = data?.external_id;
    if (!externalId) {
      console.error("❌ No external_id found for email:", email);
      return res.status(404).json({ error: "User not found" });
    }

    res.setHeader(
      "Set-Cookie",
      serialize("external_id", externalId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    );

    console.log(`✅ Verified: ${email} → ${externalId}`);
    return res.status(200).json({ email, external_id: externalId });
  } catch (err: any) {
    console.error("❌ Verify-token failed:", err?.message || err);
    return res.status(500).json({ error: "Failed to retrieve customer data" });
  }
}
