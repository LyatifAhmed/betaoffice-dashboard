// pages/api/billing/add-card.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // Stripe Elements entegrasyonu yapılana kadar:
  return res.status(501).json({ error: "Use Stripe Elements to add a card on the client." });
}
