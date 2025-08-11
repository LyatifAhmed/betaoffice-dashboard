// pages/api/send-login-link.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { generateToken } from "../../lib/auth";
import { parse } from "cookie";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { email } = req.body as { email?: string };

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    const backendUrl = getBackendUrl();

    // Backend: GET /customer?email=...
    const r = await fetch(
      `${backendUrl}/customer?email=${encodeURIComponent(email)}`,
      withBasicAuth({ headers: { accept: "application/json" } })
    );

    if (r.status === 404) {
      return res.status(404).json({ error: "Email not found in our system" });
    }
    if (!r.ok) {
      const text = await r.text();
      console.error("❌ API fetch failed:", r.status, text);
      return res.status(500).json({ error: "Failed to verify email." });
    }

    const customer = await r.json();
    if (customer?.subscription?.status === "CANCELLED") {
      return res.status(403).json({ error: "Your subscription has been cancelled." });
    }

    console.log("✅ Customer verified:", customer?.external_id);

    // 🔐 Token & URL
    const token = generateToken(email);
    const baseUrl = (
      process.env.BASE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined) ||
      req.headers.origin ||
      "http://localhost:3000"
    ).replace(/\/$/, "");
    const loginUrl = `${baseUrl}/magic-login?token=${encodeURIComponent(token)}`;

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

    // ✉️ Send email
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
    console.error("❌ Email sending flow failed:", err?.message || err);
    return res.status(500).json({ error: "Failed to send login email" });
  }
}
