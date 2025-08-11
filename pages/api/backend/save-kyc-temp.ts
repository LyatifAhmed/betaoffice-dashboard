import type { NextApiRequest, NextApiResponse } from "next";
import { hoxtonClient } from "./_client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();
  try {
    const api = hoxtonClient();
    const r = await api.post("/api/save-kyc-temp", req.body);
    res.status(r.status).json(r.data);
  } catch (e: any) {
    const status = e?.response?.status || 500;
    const data = e?.response?.data || { error: "upstream_error" };
    console.error("[save-kyc-temp] fail:", status, data);
    res.status(status).json(typeof data === "object" ? data : { error: String(data) });
  }
}
