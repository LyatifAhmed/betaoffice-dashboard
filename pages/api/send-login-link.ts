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
  const HOXTON_USER = process.env.BASIC_AUTH_USER!;
  const HOXTON_PASS = process.env.BASIC_AUTH_PASS!;
  if (!backendUrl || !HOXTON_USER || !HOXTON_PASS) {
    console.error("❌ Missing env variables:", { backendUrl, HOXTON_USER, HOXTON_PASS });
    return res.status(500).json({ error: "Missing Hoxton config" });
  }

  let customer;
  try {
    const { data } = await axios.get(`${backendUrl}/customer?email=${email}`, {
      auth: {
        username: HOXTON_USER,
        password: HOXTON_PASS,
      },
    });

    customer = data;

    if (!customer?.external_id) {
      console.warn("⚠️ Email not found:", email);
      return res.status(404).json({ error: "Email not found in our system" });
    }

    if (customer?.subscription?.status === "CANCELLED") {
      return res.status(403).json({ error: "Your subscription has been cancelled." });
    }

    console.log("✅ Customer verified:", customer.external_id);
  } catch (err: any) {
    console.error("❌ API fetch failed:", JSON.stringify(err.response?.data || err.message));
    return res.status(500).json({ error: "Failed to verify email." });
  }

  // 🔐 Token & URL
  const token = generateToken(email);
  const loginUrl = `${process.env.BASE_URL}/magic-login?token=${token}`;

  // 📩 Load & inject template
  const templatePath = path.join(process.cwd(), "emails", "magic_link_email.html");

  let htmlTemplate: string;
  try {
    htmlTemplate = fs.readFileSync(templatePath, "utf8");
  } catch (readErr) {
    console.error("❌ Failed to read email template:", readErr);
    return res.status(500).json({ error: "Email template not found" });
  }

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
          cid: "logo",
        },
      ],
    });

    console.log("✅ Login email sent to:", email);
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error(
      "❌ Email sending failed:",
      JSON.stringify(err, Object.getOwnPropertyNames(err), 2)
    );
    return res.status(500).json({ error: "Failed to send login email" });
  }
}
