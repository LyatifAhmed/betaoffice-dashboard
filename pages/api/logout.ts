// pages/api/logout.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Çerez silerken production’da kullandığın domain’i (varsa) ekle
  const cookieDomain =
    process.env.NODE_ENV === "production" && process.env.COOKIE_DOMAIN
      ? process.env.COOKIE_DOMAIN
      : undefined;

  const common = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    domain: cookieDomain, // prod’da örn. ".betaoffice.com"
  };

  // Birden fazla cookie temizlemek istersen bu diziye ekle
  const cookies = [
    serialize("external_id", "", common),
    // serialize("auth_token", "", common),
  ];

  res.setHeader("Set-Cookie", cookies);
  res.setHeader("Cache-Control", "no-store");
  return res.status(200).json({ message: "Logged out successfully" });
}
