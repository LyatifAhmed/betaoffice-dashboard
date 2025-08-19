// pages/api/team/index.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backend = getBackendUrl();

  try {
    if (req.method === "GET") {
      const external_id = req.query.external_id as string;
      if (!external_id) return res.status(400).json({ error: "external_id required" });

      const r = await fetch(`${backend}/team?external_id=${encodeURIComponent(external_id)}`, withBasicAuth());
      const j = await r.json();
      return res.status(r.status).json(j);
    }

    if (req.method === "POST") {
      // invite
      const r = await fetch(`${backend}/team/invite`, withBasicAuth({
        method: "POST",
        headers: {"content-type":"application/json"},
        body: JSON.stringify(req.body),
      }));
      const j = await r.json();
      return res.status(r.status).json(j);
    }

    return res.status(405).end("Method not allowed");
  } catch (e:any) {
    console.error("Team proxy /index error", e);
    return res.status(500).json({ error: "proxy_error", detail: e?.message });
  }
}
