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
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE}/customer?email=${email}`);
    const externalId = response.data.external_id;

    // Güvenli HTTP-only cookie ayarlama
    res.setHeader("Set-Cookie", [
      serialize("external_id", externalId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 gün
      }),
    ]);

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Lookup failed", err);
    return res.status(500).json({ error: "Failed to retrieve customer data" });
  }
}
