import type { NextApiRequest, NextApiResponse } from "next";

function getQuery(req: NextApiRequest, key: string): string | null {
  const v = req.query[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0] ?? null;
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const postcode = getQuery(req, "postcode")?.trim();
    if (!postcode) return res.status(400).json({ error: "postcode is required" });

    const apiKey = process.env.GETADDRESS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GETADDRESS_API_KEY missing" });

    const url = `https://api.getaddress.io/find/${encodeURIComponent(postcode)}?api-key=${encodeURIComponent(apiKey)}&expand=true`;
    const r = await fetch(url, { headers: { accept: "application/json" } });
    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({ error: data?.Message || "find failed" });
    }

    // UI bekliyor: { addresses: string[] }
    const addresses: string[] = Array.isArray(data?.addresses) ? data.addresses : [];
    res.setHeader("Cache-Control", "private, max-age=0, s-maxage=43200, stale-while-revalidate=60");
    return res.status(200).json({ addresses });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "server error" });
  }
}
