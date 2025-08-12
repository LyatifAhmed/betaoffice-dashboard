import type { NextApiRequest, NextApiResponse } from "next";

type Suggestion = { address: string; id: string };

function getQuery(req: NextApiRequest, key: string): string | null {
  const v = req.query[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v[0] ?? null;
  return null;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const term = getQuery(req, "term")?.trim();
    const topStr = getQuery(req, "top") ?? "6";
    const top = Number.isFinite(Number(topStr)) ? Number(topStr) : 6;

    if (!term) return res.status(400).json({ error: "term is required" });

    const apiKey = process.env.GETADDRESS_API_KEY;
    if (!apiKey) return res.status(500).json({ error: "GETADDRESS_API_KEY missing" });

    const url = `https://api.getaddress.io/autocomplete/${encodeURIComponent(term)}?api-key=${encodeURIComponent(apiKey)}&top=${top}`;
    const r = await fetch(url, { headers: { accept: "application/json" } });
    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({ error: data?.Message || "autocomplete failed" });
    }

    // Bekleyen UI: data.suggestions => [{address,id}]
    const suggestions: Suggestion[] = Array.isArray(data?.suggestions) ? data.suggestions : [];
    res.setHeader("Cache-Control", "private, max-age=0, s-maxage=43200, stale-while-revalidate=60");
    return res.status(200).json({ suggestions });
  } catch (e: any) {
    return res.status(500).json({ error: e?.message || "server error" });
  }
}
