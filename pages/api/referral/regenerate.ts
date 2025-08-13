// pages/api/referral/regenerate.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { external_id } = req.body || {};
  if (!external_id) return res.status(400).json({ error: "missing external_id" });

  try {
    const backend = getBackendUrl();
    const r = await fetch(`${backend}/referral/regenerate`, {
      method: "POST",
      ...withBasicAuth({ headers: { "content-type": "application/json" } }),
      body: JSON.stringify({ external_id }),
    });
    const text = await r.text();
    if (!r.ok) return res.status(r.status).send(text || "backend error");
    res.setHeader("content-type", "application/json");
    return res.status(200).send(text);
  } catch (e: any) {
    console.error("Referral regenerate proxy error:", e?.message || e);
    return res.status(500).json({ error: "Failed to regenerate referral code" });
  }
}
