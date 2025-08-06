import type { NextApiRequest, NextApiResponse } from "next";
import { serialize } from "cookie";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // ❌ external_id cookie’sini sil
  res.setHeader(
    "Set-Cookie",
    serialize("external_id", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0, // ⛔ Süreyi sıfırla → cookie'yi siler
    })
  );

  return res.status(200).json({ message: "Logged out successfully" });
}
