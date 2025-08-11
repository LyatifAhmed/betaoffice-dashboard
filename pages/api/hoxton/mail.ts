// pages/api/hoxton/mail.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  const external_id = req.query.external_id as string | undefined;
  const source = (req.query.source as "remote" | "db" | undefined) ?? "remote";

  if (!external_id) {
    return res.status(400).json({ error: "Missing external_id" });
  }

  try {
    const backend = getBackendUrl();
    const url =
      source === "db"
        ? `${backend}/mail?external_id=${encodeURIComponent(external_id)}`
        : `${backend}/subscription/${encodeURIComponent(external_id)}/mail`;

    const r = await fetch(url, withBasicAuth({ headers: { accept: "application/json" } }));
    const text = await r.text();

    if (!r.ok) {
      // backend hatasını mümkün olduğunca aynen geçir
      return res.status(r.status).send(text || "backend error");
    }

    res.setHeader("content-type", "application/json");
    return res.status(200).send(text);
  } catch (err: any) {
    console.error("Mail fetch error:", err?.message || err);
    return res.status(500).json({ error: "Failed to fetch mail items" });
  }
}
