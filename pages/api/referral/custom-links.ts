// pages/api/referral/custom-links.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");
  const owner = req.query.owner as string | undefined;
  if (!owner) return res.status(400).json({ error: "missing owner" });
  try {
    const be = getBackendUrl();
    const r = await fetch(`${be}/referral/custom-links?owner=${encodeURIComponent(owner)}`, withBasicAuth());
    const text = await r.text();
    res.status(r.status).send(text || "");
  } catch (e) {
    console.error("custom-links proxy error", e);
    res.status(500).json({ error: "proxy error" });
  }
}
