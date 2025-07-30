// pages/api/admin-auth.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { username, password } = req.body;

  if (
    username === process.env.NEXT_PUBLIC_ADMIN_USER &&
    password === process.env.NEXT_PUBLIC_ADMIN_PASS
  ) {
    return res.status(200).json({ ok: true });
  } else {
    return res.status(401).json({ error: "Unauthorized" });
  }
}
