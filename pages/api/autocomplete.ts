import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.GETADDRESS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GETADDRESS_API_KEY missing" });

  const term = (req.query.term as string) || "";
  if (!term || term.trim().length < 3) {
    return res.status(200).json({ suggestions: [] });
  }

  // opsiyonel parametreler
  const top = (req.query.top as string) || "6";
  const showPostcode = (req.query.showPostcode as string) === "true" ? "true" : "false";

  const url = new URL(`https://api.getAddress.io/autocomplete/${encodeURIComponent(term)}`);
  url.searchParams.set("api-key", apiKey);
  url.searchParams.set("top", top);
  url.searchParams.set("all", "true");           // posta kodu içeren sorgularda tüm sonuçları göster
  url.searchParams.set("show-postcode", showPostcode);

  // body ile gönderilen filter/location desteği (GET + body yerine query/POST da olabilir)
  // Basit tutuyoruz: GET query string içinde gelmediyse body’den de alalım.
  const filter = (req.method === "POST" ? (req.body?.filter || null) : null);
  const location = (req.method === "POST" ? (req.body?.location || null) : null);

  try {
    const r = await fetch(url.toString(), { method: "GET" });
    if (!r.ok) {
      const e = await r.text();
      return res.status(r.status).json({ error: e || "autocomplete failed" });
    }
    const data = await r.json();
    // Beklenen çıktı: { suggestions: [{ address, url, id }, ...] }
    return res.status(200).json({ suggestions: data?.suggestions ?? [] });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "autocomplete error" });
  }
}
