// pages/api/backend/cancel-at-period-end.ts
import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" })
  }

  try {
    const { stripe_subscription_id } = JSON.parse(req.body)

    if (!stripe_subscription_id) {
      return res.status(400).json({ error: "Missing stripe_subscription_id" })
    }

    const baseURL = process.env.HOXTON_API_BASE_URL || "http://localhost:8000"

    const response = await fetch(
      `${baseURL}/subscription/${stripe_subscription_id}/cancel-at-period-end`,
      {
        method: "POST",
      }
    )

    if (!response.ok) {
      const errData = await response.json()
      return res.status(response.status).json({
        error: "Failed to cancel subscription",
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
