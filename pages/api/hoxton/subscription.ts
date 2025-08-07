import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  const { external_id } = req.query;

  if (!external_id || typeof external_id !== "string") {
    return res.status(400).json({ error: "Missing or invalid external_id" });
  }

  if (!API_BASE_URL) {
    return res.status(500).json({ error: "Backend API base URL not configured" });
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/api/subscription/${external_id}`, {
      auth: {
        username: process.env.HOXTON_API_KEY!,
        password: "",
      },
    });

    return res.status(200).json(response.data);
  } catch (err: any) {
    console.error("Subscription fetch error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch subscription data" });
  }
}
