import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { postcode } = req.query;

  if (!postcode || typeof postcode !== "string") {
    return res.status(400).json({ error: "Missing postcode" });
  }

  const apiKey = process.env.GETADDRESS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "API key not set" });
  }

  try {
    const response = await axios.get(
      `https://api.getaddress.io/find/${encodeURIComponent(postcode)}?api-key=${apiKey}`
    );
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("getAddress API error:", error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.Message || "Address fetch failed",
    });
  }
}
