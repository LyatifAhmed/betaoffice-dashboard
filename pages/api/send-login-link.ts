import type { NextApiRequest, NextApiResponse } from "next";
import { generateToken } from "../../lib/auth";
import nodemailer from "nodemailer";
import axios from "axios";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { email } = req.body;

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const backendUrl = process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL;
  if (!backendUrl) {
    return res.status(500).json({ error: "Missing backend URL" });
  }

  let customer;
  try {
    const check = await axios.get(`${backendUrl}/customer?email=${email}`);
    customer = check.data;

    // ❗ KYC durumu kontrolü
    if (!customer?.external_id) {
      return res.status(404).json({ error: "Email not found in our system" });
    }

    if (customer?.review_status !== "ACTIVE") {
      return res.status(403).json({ error: "Your account has not been approved yet." });
    }

  } catch (err) {
  if (err instanceof Error) {
    console.error("Email send error:", (err as any).response || err.message);
  } else {
    console.error("Unknown error:", err);
  }

  return res.status(500).json({ error: "Failed to send email." });
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
      subject: "Your secure BetaOffice login link",
      html: `
        <p>Hello ${customer.customer_first_name || ""},</p>
        <p>Click the secure link below to access your <strong>BetaOffice</strong> dashboard:</p>
        <p><a href="${loginUrl}" style="color: #1d4ed8;">Login to BetaOffice</a></p>
        <p>This link will expire in <strong>15 minutes</strong>.</p>
        <br />
        <p style="font-size: 0.9rem; color: #555;">
          If you did not request this email, you can safely ignore it.<br/>
          – The BetaOffice Team
        </p>
      `,
    });

    return res.status(200).json({ success: true });

  } catch (err) {
    console.error("Email sending failed:", err);
    return res.status(500).json({ error: "Failed to send login email" });
  }
}
