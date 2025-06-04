// pages/api/set-cookie.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { external_id } = req.body;
  if (!external_id) return res.status(400).json({ error: "Missing external_id" });

  res.setHeader("Set-Cookie", [
    serialize("external_id", external_id, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    }),
  ]);

  return res.status(200).json({ success: true });
}
