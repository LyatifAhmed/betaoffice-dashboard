import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") return res.status(405).end("Method Not Allowed");

  const { external_id } = req.query;

  if (!external_id || typeof external_id !== "string") {
    return res.status(400).json({ error: "Missing or invalid external_id" });
  }

  try {
    const response = await axios.get(
      `https://api.hoxtonmix.com/api/v2/subscription/${external_id}/mail`,
      {
        auth: {
          username: process.env.HOXTON_API_KEY!,
          password: "",
        },
      }
    );

    return res.status(200).json(response.data);
  } catch (err: any) {
    console.error("Mail fetch error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to fetch mail items" });
  }
}
