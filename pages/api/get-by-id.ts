import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.GETADDRESS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GETADDRESS_API_KEY missing" });

  const id = (req.query.id as string) || "";
  if (!id) return res.status(400).json({ error: "id is required" });

  const url = `https://api.getAddress.io/get/${encodeURIComponent(id)}?api-key=${encodeURIComponent(apiKey)}`;

  try {
    const r = await fetch(url);
    if (!r.ok) {
      const e = await r.text();
      return res.status(r.status).json({ error: e || "get-by-id failed" });
    }
    const data = await r.json();
    // Direkt orijinal şemayı dönüyoruz (AddressPicker içinde normalize edeceğiz)
    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "get-by-id error" });
  }
}
