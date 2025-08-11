import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.GETADDRESS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "GETADDRESS_API_KEY missing" });

  const postcode = (req.query.postcode as string) || "";
  if (!postcode) return res.status(400).json({ error: "postcode is required" });

  const url = `https://api.getAddress.io/find/${encodeURIComponent(postcode)}?api-key=${encodeURIComponent(apiKey)}`;

  try {
    const r = await fetch(url);
    const text = await r.text();
    if (!r.ok) {
      let payload: any = text;
      try { payload = JSON.parse(text); } catch {}
      return res.status(r.status).json(payload || { error: "find failed" });
    }
    const data = JSON.parse(text);
    // Beklenen şema: { addresses: string[], postcode: string, ... }
    return res.status(200).json(data);
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "find error" });
  }
}
