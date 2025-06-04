import type { NextApiRequest, NextApiResponse } from "next";
import { generateToken } from "../../lib/auth";
import nodemailer from "nodemailer";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;
  if (!email || typeof email !== "string") {
    return res.status(400).json({ error: "Invalid email" });
  }

  const token = generateToken(email);
  const loginUrl = `${process.env.BASE_URL}/magic-login?token=${token}`;

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false, // TLS on port 587
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

