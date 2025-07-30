// lib/email/sendInviteEmail.ts
import nodemailer from "nodemailer";

export async function sendInviteEmail({
  to,
  name,
  inviteLink,
}: {
  to: string;
  name: string;
  inviteLink: string;
}) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "465"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Generation Beta" <${process.env.SMTP_USER}>`,
    to,
    subject: "Complete Your Identity Verification",
    html: `
      <p>Hello ${name},</p>
      <p>Please complete your identity verification by clicking the secure link below:</p>
      <p><a href="${inviteLink}" target="_blank">${inviteLink}</a></p>
      <p>If you have any questions, feel free to contact us.</p>
      <p>– Generation Beta Digital</p>
    `,
  });
}
