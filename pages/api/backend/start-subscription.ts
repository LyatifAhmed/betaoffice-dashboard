// pages/api/backend/start-subscription.ts
import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  try {
    const { external_id } = JSON.parse(req.body)

    if (!external_id) {
      return res.status(400).json({ error: "Missing external_id" })
    }

    const baseURL = process.env.HOXTON_API_BASE_URL || "http://localhost:8000"

    const response = await fetch(`${baseURL}/subscription/${external_id}/start`, {
      method: "POST",
    })

    if (!response.ok) {
      const errData = await response.json()
      return res.status(response.status).json({
        error: "Failed to restart subscription",
        details: errData,
      })
    }

    const data = await response.json()
    res.status(200).json(data)
  } catch (error) {
    console.error("API Error:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
}
