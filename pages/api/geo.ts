// pages/api/geo.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Vercel/Cloudflare gibi PaaS’lar bu header’ı koyar
  const h = req.headers;
  const country =
    (h["x-vercel-ip-country"] as string) ||
    (h["cf-ipcountry"] as string) ||
    // Accept-Language'dan tahmin (en-GB → GB)
    (String(h["accept-language"] || "")
      .split(",")[0]
      .toLowerCase()
      .includes("gb")
      ? "GB"
      : "") ||
    "GB"; // güvenli varsayılan: GB

  res.status(200).json({ country: "GB" });
}
