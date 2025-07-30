// pages/api/send-invite.ts
import { sendInviteEmail } from "@/lib/email/sendInviteEmail";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  const { to, name, inviteLink } = req.body;

  if (!to || !name || !inviteLink) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    await sendInviteEmail({ to, name, inviteLink });
    return res.status(200).json({ success: true });
  } catch (error: any) {
    console.error("Email sending error:", error);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
