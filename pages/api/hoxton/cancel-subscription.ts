import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { external_id } = req.body;

  if (!external_id || typeof external_id !== "string") {
    return res.status(400).json({ error: "Missing or invalid external_id" });
  }

  try {
    const endDate = "END_OF_TERM"; // Dönem sonunda iptal
    const cancellationReason = "Requested";

    const url = `https://api.hoxtonmix.com/api/v2/subscription/${external_id}/stop/${endDate}/${cancellationReason}`;

    const response = await axios.post(url, {}, {
      auth: {
        username: process.env.HOXTON_API_KEY!,
        password: "",
      },
    });

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("Cancellation error:", err.response?.data || err.message);
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
}

