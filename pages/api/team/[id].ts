// pages/api/team/[id].ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const backend = getBackendUrl();
  const { id } = req.query;

  if (!id) return res.status(400).json({ error: "missing member id" });

  try {
    if (req.method === "PATCH") {
      const r = await fetch(`${backend}/team/${id}`, withBasicAuth({
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(req.body),
      }));
      const j = await r.json();
      return res.status(r.status).json(j);
    }

    if (req.method === "DELETE") {
      const r = await fetch(`${backend}/team/${id}`, withBasicAuth({ method: "DELETE" }));
      const j = await r.json();
      return res.status(r.status).json(j);
    }

    return res.status(405).end("Method not allowed");
  } catch (e:any) {
    console.error("Team proxy /[id] error", e);
    return res.status(500).json({ error: "proxy_error", detail: e?.message });
  }
}
