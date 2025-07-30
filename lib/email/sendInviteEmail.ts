import nodemailer from "nodemailer";

type Props = {
  to: string;
  name: string;
  inviteLink: string;
};

export async function sendInviteEmail({ to, name, inviteLink }: Props) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
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
      <p>Hi ${name},</p>
      <p>Please complete your identity verification by clicking the secure link below:</p>
      <p><a href="${inviteLink}" target="_blank">${inviteLink}</a></p>
      <p>If you have any questions, feel free to contact us.</p>
      <p>— Generation Beta Digital</p>
    `,
  });
}

