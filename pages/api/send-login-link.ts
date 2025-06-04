import type { NextApiRequest, NextApiResponse } from "next";
import { generateToken } from "../../lib/auth";
import nodemailer from "nodemailer";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Invalid email" });
  }

  try {
    // 🚨 Yeni: Veritabanında kayıtlı mı kontrol et
    const check = await axios.get(`${process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL}/customer?email=${email}`);
    if (!check.data.external_id) {
      return res.status(404).json({ error: "Email not found in our system" });
    }
  } catch (err) {
    return res.status(404).json({ error: "Email not found in our system" });
  }

  const token = generateToken(email);
  const loginUrl = `${process.env.BASE_URL}/magic-login?token=${token}`;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"BetaOffice" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your secure login link",
      html: `
        <p>Hello,</p>
        <p>Click the secure link below to log in to your BetaOffice dashboard:</p>
        <p><a href="${loginUrl}">${loginUrl}</a></p>
        <p>This link will expire in 15 minutes for your security.</p>
        <br />
        <p>– BetaOffice Team</p>
      `,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Email error:", err);
    return res.status(500).json({ error: "Failed to send email" });
  }
}
