import type { NextApiRequest, NextApiResponse } from "next";
import { generateToken } from "../../lib/auth";
import nodemailer from "nodemailer";
import axios from "axios";
import fs from "fs";
import path from "path";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { email } = req.body;

  if (
    !email ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  const backendUrl = process.env.NEXT_PUBLIC_HOXTON_API_BACKEND_URL;
  if (!backendUrl) {
    return res.status(500).json({ error: "Missing backend URL" });
  }

  let customer;
  try {
    const { data } = await axios.get(`${backendUrl}/customer?email=${email}`);
    customer = data;

    if (!customer?.external_id) {
      return res.status(404).json({ error: "Email not found in our system" });
    }

    if (customer?.subscription?.status === "CANCELLED") {
      return res.status(403).json({ error: "Your subscription has been cancelled." });
    }
  } catch (err) {
    console.error("Email send error:", (err as any)?.response?.data || err);
    return res.status(500).json({ error: "Failed to verify email." });
  }

  // 🔐 Token & URL
  const token = generateToken(email);
  const loginUrl = `${process.env.BASE_URL}/magic-login?token=${token}`;

  // 📩 Load & inject template
  const templatePath = path.join(process.cwd(), "emails", "magic_link_email.html");
  let htmlTemplate = fs.readFileSync(templatePath, "utf8");

  htmlTemplate = htmlTemplate
    .replace(/{{MAGIC_LINK}}/g, loginUrl)
    .replace(/{{FIRST_NAME}}/g, customer.customer_first_name || "there");

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
      html: htmlTemplate,
      attachments: [
        {
          filename: "logo.png",
          path: path.join(process.cwd(), "public", "logo.png"),
          cid: "logo", // ↳ HTML içinde: <img src="cid:logo" />
        },
      ],
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Email sending failed:", err);
    return res.status(500).json({ error: "Failed to send login email" });
  }
}
