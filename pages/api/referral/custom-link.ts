// pages/api/referral/custom-link.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const be = getBackendUrl();
  try {
    if (req.method === "POST") {
      const r = await fetch(`${be}/referral/custom-link`, {
        method: "POST",
        ...withBasicAuth({ headers: { "content-type": "application/json" } }),
        body: JSON.stringify(req.body || {}),
      });
      const text = await r.text();
      res.status(r.status).send(text || "");
      return;
    }
    if (req.method === "PATCH") {
      const r = await fetch(`${be}/referral/custom-link`, {
        method: "PATCH",
        ...withBasicAuth({ headers: { "content-type": "application/json" } }),
        body: JSON.stringify(req.body || {}),
      });
      const text = await r.text();
      res.status(r.status).send(text || "");
      return;
    }
    if (req.method === "DELETE") {
      const r = await fetch(`${be}/referral/custom-link`, {
        method: "DELETE",
        ...withBasicAuth({ headers: { "content-type": "application/json" } }),
        body: JSON.stringify(req.body || {}),
      });
      const text = await r.text();
      res.status(r.status).send(text || "");
      return;
    }
    res.status(405).end("Method Not Allowed");
  } catch (e) {
    console.error("custom-link proxy error", e);
    res.status(500).json({ error: "proxy error" });
  }
}
