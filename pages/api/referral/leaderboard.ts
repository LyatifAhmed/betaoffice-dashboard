// pages/api/referral/leaderboard.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");
  try {
    const backend = getBackendUrl();
    const r = await fetch(`${backend}/referral/leaderboard`, withBasicAuth());
    const text = await r.text();
    if (!r.ok) return res.status(r.status).send(text || "backend error");
    res.setHeader("content-type", "application/json");
    return res.status(200).send(text);
  } catch (e: any) {
    console.error("Referral leaderboard proxy error:", e?.message || e);
    return res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
}
