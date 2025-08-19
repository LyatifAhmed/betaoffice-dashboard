import type { NextApiRequest, NextApiResponse } from "next";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  const externalId = req.query.external_id as string | undefined;
  if (!externalId) return res.status(400).json({ error: "missing external_id" });

  try {
    const be = getBackendUrl();
    const r = await fetch(`${be}/team/members?external_id=${encodeURIComponent(externalId)}`, withBasicAuth());
    const text = await r.text();
    if (!r.ok) return res.status(r.status).send(text || "backend error");
    res.setHeader("content-type", "application/json");
    res.status(200).send(text);
  } catch (e) {
    console.error("team members proxy error", e);
    res.status(500).json({ error: "Failed to fetch team members" });
  }
}
