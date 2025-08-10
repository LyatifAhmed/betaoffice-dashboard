// pages/api/find-address.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\d[A-Z]{2}$/; // UK için kaba kontrol (SE16NR -> SE16NR)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const raw = req.query.postcode;
    if (!raw || typeof raw !== "string") {
      return res.status(400).json({ error: "Missing postcode" });
    }

    // Normalize: boşlukları kaldır, büyük harf yap
    const postcode = raw.replace(/\s+/g, "").toUpperCase();

    if (!POSTCODE_RE.test(postcode)) {
      return res.status(400).json({ error: "Invalid postcode format" });
    }

    const apiKey = process.env.GETADDRESS_API_KEY; // ❗ server-only; Vercel'de Bu ortam değişkeni kullanın
    if (!apiKey) {
      return res.status(500).json({ error: "API key not set" });
    }

    const client = axios.create({
      timeout: 6000,
      validateStatus: () => true, // hataları kendimiz map'leyeceğiz
    });

    // İsterseniz 'expand=true' daha detaylı adres döndürür
    const url = `https://api.getaddress.io/find/${encodeURIComponent(postcode)}?api-key=${apiKey}&expand=true`;

    // Basit retry (2 deneme)
    let lastResp;
    for (let i = 0; i < 2; i++) {
      lastResp = await client.get(url);
      if (lastResp.status >= 500) continue; // tekrar dene
      break;
    }

    const status = lastResp!.status;
    const data = lastResp!.data;

    if (status === 200) {
      return res.status(200).json(data);
    }

    // Hata haritalama
    if (status === 401 || status === 403) {
      return res.status(status).json({ error: "Unauthorized: check GETADDRESS_API_KEY" });
    }
    if (status === 404) {
      return res.status(404).json({ error: "Postcode not found" });
    }
    if (status === 429) {
      return res.status(429).json({ error: "Rate limit exceeded" });
    }

    // Varsayılan
    return res.status(status || 500).json({
      error: data?.Message || "Address fetch failed",
    });
  } catch (err: any) {
    console.error("getAddress API error:", err?.message || err);
    return res.status(500).json({ error: "Address fetch failed" });
  }
}
