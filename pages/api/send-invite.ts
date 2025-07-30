// pages/api/send-invite.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { sendInviteEmail } from "@/lib/email/sendInviteEmail"; // yol projeye göre değişebilir

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { to, name, inviteLink } = req.body;

  if (!to || !name || !inviteLink) {
    return res.status(400).json({ error: "Missing required fields." });
  }

  try {
    await sendInviteEmail({ to, name, inviteLink });
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Error sending invite:", err);
    res.status(500).json({ error: "Failed to send invite email." });
  }
}
