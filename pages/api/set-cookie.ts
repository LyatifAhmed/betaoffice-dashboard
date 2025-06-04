// pages/api/set-cookie.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { external_id } = req.body;

  if (!external_id || typeof external_id !== "string") {
    return res.status(400).json({ error: "Missing or invalid external_id" });
  }

  // ✅ Güvenli ve cross-site uyumlu cookie ayarı
  const isProduction = process.env.NODE_ENV === "production";

  res.setHeader("Set-Cookie", serialize("external_id", external_id, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax", // ✅ küçük harf!
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  }));


  return res.status(200).json({ success: true });
}
