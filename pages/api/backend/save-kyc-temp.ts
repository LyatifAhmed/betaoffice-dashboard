// pages/api/backend/save-kyc-temp.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getBackendUrl } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  try {
    const backend = getBackendUrl(); // .env.local -> HOXTON_API_URL
    if (!backend) {
      return res.status(500).json({ error: "backend_url_missing" });
    }

    const upstream = await fetch(`${backend}/api/save-kyc-temp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(req.body),
    });

    const text = await upstream.text();
    console.error("[proxy/save-kyc-temp] upstream", upstream.status, text);

    res.status(upstream.status);
    // JSON ise JSON döndür, değilse raw text
    try {
      res.setHeader("content-type", "application/json");
      return res.send(text ? JSON.parse(text) : {});
    } catch {
      res.setHeader("content-type", upstream.headers.get("content-type") || "text/plain");
      return res.send(text);
    }
  } catch (e: any) {
    console.error("proxy save-kyc-temp error:", e?.message || e);
    return res.status(502).json({ error: "bad_gateway", detail: String(e?.message || e) });
  }
}
