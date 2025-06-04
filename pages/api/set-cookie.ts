import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { external_id } = req.body;
  if (!external_id || typeof external_id !== "string") {
    return res.status(400).json({ error: "Missing external_id" });
  }

  res.setHeader("Set-Cookie", `external_id=${external_id}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`);
  return res.status(200).json({ success: true });
}
