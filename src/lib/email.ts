import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

const SMTP_HOST = process.env.SMTP_HOST || "localhost";
const SMTP_PORT = parseInt(process.env.SMTP_PORT || "587");
const SMTP_USER = process.env.SMTP_USER || "";
const SMTP_PASS = process.env.SMTP_PASS || "";
const SMTP_SECURE = process.env.SMTP_SECURE === "true";
const EMAIL_FROM = process.env.EMAIL_FROM || "no-reply@bumdes.local";

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
    });
  }
  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  if (!SMTP_HOST || SMTP_HOST === "localhost") {
    console.warn("SMTP host not configured, skipping email send");
    return false;
  }

  try {
    const info = await getTransporter().sendMail({
      from: EMAIL_FROM,
      ...options,
    });

    console.log("Email sent:", info.messageId);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export function generateApprovalEmailHtml(title: string, message: string, actionUrl?: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; padding: 24px; }
    .header { background-color: #2563eb; color: white; padding: 16px 24px; border-radius: 8px 8px 0 0; }
    h1 { margin: 0; font-size: 20px; }
    .content { padding: 20px 0; }
    .message { font-size: 16px; color: #333; line-height: 1.5; }
    .button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 16px; }
    .footer { font-size: 12px; color: #999; margin-top: 20px; border-top: 1px solid #eee; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      <div class="message">${message}</div>
      ${actionUrl ? `<a href="${actionUrl}" class="button">Buka Sekarang</a>` : ""}
    </div>
    <div class="footer">
      <p>Sistem Informasi Terpadu BUMDes Maju Langgeng</p>
      <p>Email ini dikirim otomatis, jangan balas.</p>
    </div>
  </div>
</body>
</html>
  `;
}
