// nexus/backend/src/services/email.ts
/**
 * Email notifications via Nodemailer.
 * Set SMTP_* env vars to enable real sending.
 * Without them, emails are logged to console only (dev mode).
 */
import nodemailer from 'nodemailer';
import { logger } from '../utils/logger';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // Dev: log-only transport
    transporter = nodemailer.createTransport({ jsonTransport: true });
  }

  return transporter;
}

interface ConnectionEmailData {
  toEmail: string;
  toName: string;
  fromName: string;
  companyName: string;
  role: string;
  message?: string;
}

export async function sendConnectionNotification(data: ConnectionEmailData) {
  const from = process.env.SMTP_FROM || 'noreply@nexus.dev';

  const html = `
    <div style="font-family: 'Space Mono', monospace; background: #070b14; color: #e2e8f0; padding: 32px; border-radius: 8px;">
      <h1 style="color: #00d4ff; font-size: 20px; margin-bottom: 4px;">NEXUS</h1>
      <p style="color: #64748b; font-size: 11px; letter-spacing: 2px; margin-top: 0;">BUSINESS INTELLIGENCE PLATFORM</p>
      <hr style="border-color: #1e2d3d; margin: 24px 0;">
      <h2 style="font-size: 16px; color: #e2e8f0;">New Connection Request</h2>
      <p style="color: #94a3b8; font-size: 14px; line-height: 1.6;">
        <strong style="color: #00d4ff;">${data.fromName}</strong> wants to connect with
        <strong style="color: #e2e8f0;">${data.companyName}</strong>
        as a <strong style="color: #7c3aed;">${data.role}</strong>.
      </p>
      ${data.message ? `
      <div style="background: #0d1422; border: 1px solid #1e2d3d; border-radius: 6px; padding: 16px; margin: 16px 0;">
        <p style="color: #64748b; font-size: 11px; letter-spacing: 1px; margin: 0 0 8px;">MESSAGE</p>
        <p style="color: #e2e8f0; font-size: 14px; margin: 0; line-height: 1.6;">${data.message}</p>
      </div>` : ''}
      <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard"
         style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #7c3aed;
                color: white; text-decoration: none; border-radius: 4px; font-size: 12px; letter-spacing: 1px;">
        VIEW IN DASHBOARD →
      </a>
      <hr style="border-color: #1e2d3d; margin: 24px 0;">
      <p style="color: #475569; font-size: 11px;">NEXUS · Global Business Intelligence</p>
    </div>
  `;

  try {
    const info = await getTransporter().sendMail({
      from,
      to: data.toEmail,
      subject: `[NEXUS] New ${data.role} connection request for ${data.companyName}`,
      html,
      text: `${data.fromName} wants to connect with ${data.companyName} as a ${data.role}.${data.message ? `\n\nMessage: ${data.message}` : ''}\n\nView in dashboard: ${process.env.FRONTEND_URL}/dashboard`,
    });

    if (process.env.SMTP_HOST) {
      logger.info(`Email sent to ${data.toEmail}: ${info.messageId}`);
    } else {
      logger.info(`[DEV] Email would have been sent to ${data.toEmail} — subject: ${`New ${data.role} connection request`}`);
    }
  } catch (err) {
    // Never throw — email failure should not break the API response
    logger.error(`Email send failed: ${err}`);
  }
}

export async function sendWelcomeEmail(toEmail: string, name: string) {
  const from = process.env.SMTP_FROM || 'noreply@nexus.dev';

  try {
    await getTransporter().sendMail({
      from,
      to: toEmail,
      subject: '[NEXUS] Welcome to the intelligence network',
      html: `
        <div style="font-family: monospace; background: #070b14; color: #e2e8f0; padding: 32px; border-radius: 8px;">
          <h1 style="color: #00d4ff;">Welcome to NEXUS, ${name}</h1>
          <p style="color: #94a3b8; line-height: 1.7;">
            You now have access to the global business intelligence map. Explore thousands of companies,
            filter by industry and type, and send connection requests as a buyer, seller, or investor.
          </p>
          <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}"
             style="display: inline-block; margin-top: 16px; padding: 10px 20px; background: #00d4ff;
                    color: #070b14; text-decoration: none; border-radius: 4px; font-size: 12px; font-weight: bold;">
            ENTER NEXUS →
          </a>
        </div>
      `,
    });
  } catch (err) {
    logger.error(`Welcome email failed: ${err}`);
  }
}
