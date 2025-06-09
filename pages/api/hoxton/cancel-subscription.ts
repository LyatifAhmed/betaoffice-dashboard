import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { external_id } = req.body;
  if (!external_id || typeof external_id !== "string") {
    return res.status(400).json({ error: "Missing or invalid external_id" });
  }

  const backendUrl = process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL;
  if (!backendUrl) {
    console.error("Missing NEXT_PUBLIC_HOXTON_API_BACKEND_URL in env");
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    const cancelUrl = `${backendUrl}/cancel-subscription`;
    const response = await axios.post(cancelUrl, { external_id });

    if (response.status === 200) {
      return res.status(200).json({ success: true });
    } else {
      console.error("Unexpected status:", response.status);
      return res.status(500).json({ error: "Unexpected response from backend" });
    }
  } catch (err: any) {
    console.error("Cancel error:", err?.response?.data || err.message || err);
    return res.status(500).json({ error: "Failed to cancel subscription" });
  }
}

