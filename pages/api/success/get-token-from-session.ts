import type { NextApiRequest, NextApiResponse } from "next";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");
  const session_id = req.query.session_id as string | undefined;
  if (!session_id) return res.status(400).json({ error: "Missing session_id" });

  try {
    const backend = getBackendUrl();
    const r = await fetch(
      `${backend}/api/get-token-from-session?session_id=${encodeURIComponent(session_id)}`,
      withBasicAuth({ headers: { accept: "application/json" } })
    );
    const text = await r.text();
    if (!r.ok) return res.status(r.status).send(text || "backend error");

    res.setHeader("content-type", "application/json");
    return res.status(200).send(text);
  } catch (err: any) {
    console.error("proxy error:", err?.message || err);
    return res.status(500).json({ error: "proxy failed" });
  }
}
