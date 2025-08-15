// pages/api/send-login-link.ts
import type { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

import { generateToken } from "@/lib/auth";
import { getBackendUrl, withBasicAuth } from "@/lib/server-backend";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { email } = (req.body ?? {}) as { email?: string };
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email address" });
  }

  try {
    const backendUrl = getBackendUrl().replace(/\/$/, ""); // no trailing slash

    // 1) Email sistemde var mı?
    const r = await fetch(
      `${backendUrl}/customer?email=${encodeURIComponent(email)}`,
      withBasicAuth({ headers: { accept: "application/json" } })
    );

    if (r.status === 404) {
      return res.status(404).json({ error: "Email not found in our system" });
    }
    if (!r.ok) {
      const text = await r.text().catch(() => "");
      console.error("❌ API fetch failed:", r.status, text);
      return res.status(500).json({ error: "Failed to verify email." });
    }

    const customer = await r.json();
    if (customer?.subscription?.status === "CANCELLED") {
      return res.status(403).json({ error: "Your subscription has been cancelled." });
    }

    // 2) Token & URL
    const token = generateToken(email);
    const baseUrl =
      (process.env.BASE_URL && process.env.BASE_URL.replace(/\/$/, "")) ||
      (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")) ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      (req.headers.origin as string) ||
      "http://localhost:3000";

    const loginUrl = `${baseUrl.replace(/\/$/, "")}/magic-login?token=${encodeURIComponent(token)}`;

    // 3) E-posta şablonu
    const templatePath = path.join(process.cwd(), "emails", "magic_link_email.html");
    let htmlTemplate = "";
    try {
      htmlTemplate = fs.readFileSync(templatePath, "utf8");
    } catch (readErr) {
      console.warn("⚠️ Email template missing, falling back to plain HTML");
      htmlTemplate = `
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto">
          <h2>Sign in to BetaOffice</h2>
          <p>Hello {{FIRST_NAME}}, click the link to sign in:</p>
          <p><a href="{{MAGIC_LINK}}">Sign in</a></p>
          <p style="font-size:12px;color:#666">{{MAGIC_LINK}}</p>
        </div>
      `;
    }

    const firstName =
      customer?.customer_first_name ||
      customer?.first_name ||
      customer?.name ||
      "there";

    const html = htmlTemplate
      .replace(/{{MAGIC_LINK}}/g, loginUrl)
      .replace(/{{FIRST_NAME}}/g, String(firstName));

    // 4) DEV fallback: SMTP yoksa linki logla ve dön
    const hasSmtp =
      !!process.env.SMTP_HOST &&
      !!process.env.SMTP_USER &&
      !!process.env.SMTP_PASS &&
      !!process.env.SMTP_PORT;

    if (!hasSmtp || process.env.DISABLE_SMTP === "1") {
      console.log("🔗 DEV Magic link:", loginUrl);
      return res.status(200).json({ success: true, dev_link: loginUrl });
    }

    // 5) SMTP gönder
    const port = Number(process.env.SMTP_PORT);
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465, // 465 → SSL
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
      },
    });

    const attachments = [];
    const logoPath = path.join(process.cwd(), "public", "logo.png");
    if (fs.existsSync(logoPath)) {
      attachments.push({ filename: "logo.png", path: logoPath, cid: "logo" });
      // HTML'in içinde <img src="cid:logo" ...> olması gerekir.
    }

    await transporter.sendMail({
      from: process.env.MAIL_FROM || `"BetaOffice" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your secure BetaOffice login link",
      html,
      attachments,
    });

    console.log("✅ Login email sent to:", email);
    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error("❌ Email sending flow failed:", err?.message || err);
    return res.status(500).json({ error: "Failed to send login email" });
  }
}
