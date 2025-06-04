import type { NextApiRequest, NextApiResponse } from "next";
import { verifyToken } from "@/lib/auth";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { token } = req.body;
  if (!token) return res.status(400).json({ error: "Missing token" });

  const email = verifyToken(token);

  if (email) {
    return res.status(200).json({ email });
  } else {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
