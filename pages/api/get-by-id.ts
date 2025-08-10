import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id;
  if (!id || typeof id !== "string") return res.status(400).json({ error: "Missing id" });

  const apiKey = process.env.GETADDRESS_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "API key not set" });

  try {
    const r = await axios.get(
      `https://api.getaddress.io/get/${encodeURIComponent(id)}?api-key=${apiKey}`
    );
    res.status(200).json(r.data); // { address, latitude, longitude, ... }
  } catch (e: any) {
    res.status(e.response?.status || 500).json({ error: e.response?.data?.Message || "Get-by-id failed" });
  }
}
