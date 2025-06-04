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
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/customer?email=${email}`
    );

    if (!response.data || !response.data.external_id) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const externalId = response.data.external_id;

    // ✅ Set secure, HTTP-only cookie
    res.setHeader("Set-Cookie", serialize("external_id", externalId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // local'de false olur
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 gün
    }));

    return res.status(200).json({ email, external_id: externalId });
  } catch (err) {
    console.error("Lookup failed", err);
    return res.status(500).json({ error: "Failed to retrieve customer data" });
  }
}
