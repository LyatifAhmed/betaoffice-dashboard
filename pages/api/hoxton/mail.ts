// pages/api/hoxton/mail.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  const external_id = req.query.external_id as string | undefined;
  const source = (req.query.source as "remote" | "db" | undefined) ?? "remote";
  const page = req.query.page as string | undefined;

  if (!external_id) {
    return res.status(400).json({ error: "Missing external_id" });
  }

  try {
    const backend = getBackendUrl();

    // URL'i güvenle kur + query paramlarını ekle
    const endpoint =
      source === "db"
        ? "/mail"
        : `/subscription/${encodeURIComponent(external_id)}/mail`;

    const url = new URL(endpoint, backend);
    if (source === "db") url.searchParams.set("external_id", external_id);
    if (page) url.searchParams.set("page", page);

    const r = await fetch(url.toString(), withBasicAuth({ headers: { accept: "application/json" } }));
    const text = await r.text();

    if (!r.ok) {
      // Backend ne döndüyse aynen geçir (debug kolaylığı)
      return res.status(r.status).send(text || "backend error");
    }

    // Normalize: her zaman düz dizi döndür
    let body: any;
    try {
      body = JSON.parse(text);
    } catch {
      // JSON değilse ham metni döndürme; boş diziye indir
      return res.status(200).json([]);
    }

    const items = Array.isArray(body)
      ? body
      : Array.isArray(body?.results)
      ? body.results
      : Array.isArray(body?.items)
      ? body.items
      : [];

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(items);
  } catch (err: any) {
    console.error("Mail fetch error:", err?.message || err);
    return res.status(500).json({ error: "Failed to fetch mail items" });
  }
}
