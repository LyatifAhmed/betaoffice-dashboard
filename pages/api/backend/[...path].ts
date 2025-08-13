// pages/api/backend/[...path].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const segments = (req.query.path as string[]) || [];
  const qs = req.url?.split("?")[1] || "";
  const url = `${getBackendUrl()}/${segments.join("/")}${qs ? `?${qs}` : ""}`;

  const isBodyAllowed = req.method && !["GET", "HEAD"].includes(req.method);
  const init: RequestInit = {
    method: req.method,
    headers: withBasicAuth({
      headers: {
        accept: req.headers["accept"] as string || "application/json",
        "content-type": (req.headers["content-type"] as string) || "application/json",
      },
    }).headers,
    body: isBodyAllowed ? JSON.stringify(req.body ?? {}) : undefined,
  };

  try {
    const r = await fetch(url, init);
    const text = await r.text();

    // Content-Type'ı aynen geçir
    const ct = r.headers.get("content-type");
    if (ct) res.setHeader("content-type", ct);
    // İstersen cache’i tamamen kapat:
    res.setHeader("Cache-Control", "no-store");

    res.status(r.status).send(text);
  } catch (e: any) {
    console.error("backend proxy error:", e?.message || e);
    res.status(500).json({ error: "backend proxy failed" });
  }
}
