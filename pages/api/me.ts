// pages/api/me.ts
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_HOXTON_API_URL || "http://localhost:8000";
const BASIC_AUTH_USER = process.env.BASIC_AUTH_USER || "";
const BASIC_AUTH_PASS = process.env.BASIC_AUTH_PASS || "";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // external_id cookie varsa onu backend’e forward edelim
    const external_id =
      req.cookies?.external_id ||
      (req.query.external_id as string | undefined) ||
      null;

    const url = new URL("/api/me", BACKEND_URL);
    if (external_id) {
      url.searchParams.set("external_id", external_id);
    }

    const r = await axios.get(url.toString(), {
      auth: { username: BASIC_AUTH_USER, password: BASIC_AUTH_PASS },
      timeout: 8000,
    });

    return res.status(200).json(r.data);
  } catch (err: any) {
    const status = err?.response?.status || 500;
    const data = err?.response?.data || { error: "API request failed" };
    console.error("⚠️ /api/me proxy error:", status, data);
    return res.status(status).json(data);
  }
}
