import "server-only";
import nodemailer from "nodemailer";
import { Resend } from "resend";
import { env } from "@/lib/env";

export type Email = { to: string; subject: string; text: string; html: string };

/** Resend when RESEND_API_KEY is set (production), otherwise SMTP (Mailpit in dev/CI). */
export async function sendEmail(email: Email): Promise<void> {
  const { RESEND_API_KEY, EMAIL_FROM, SMTP_HOST, SMTP_PORT } = env();
  if (RESEND_API_KEY) {
    const { error } = await new Resend(RESEND_API_KEY).emails.send({ from: EMAIL_FROM, ...email });
    if (error) throw new Error(`Resend: ${error.name}: ${error.message}`);
    return;
  }
  const transport = nodemailer.createTransport({ host: SMTP_HOST, port: SMTP_PORT, secure: false });
  await transport.sendMail({ from: EMAIL_FROM, ...email });
}

export function magicLinkEmail(to: string, url: string): Email {
  const subject = "Your sign-in link for BEMACS Exam Prep";
  const text = [
    "Click the link below to sign in to BEMACS Exam Prep.",
    "",
    url,
    "",
    "The link expires in 15 minutes and can be used once.",
    "If you did not request it, you can ignore this email.",
  ].join("\n");
  const html = `<!doctype html>
<html><body style="font-family: system-ui, sans-serif; line-height: 1.5; color: #171717;">
  <p>Click the button below to sign in to <strong>BEMACS Exam Prep</strong>.</p>
  <p><a href="${escapeHtml(url)}" style="display: inline-block; padding: 10px 16px; background: #171717; color: #fff; border-radius: 6px; text-decoration: none;">Sign in</a></p>
  <p style="font-size: 13px; color: #525252;">Or paste this link into your browser:<br>${escapeHtml(url)}</p>
  <p style="font-size: 13px; color: #525252;">The link expires in 15 minutes and can be used once. If you did not request it, you can ignore this email.</p>
</body></html>`;
  return { to, subject, text, html };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
