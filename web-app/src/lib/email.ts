import { Resend } from 'resend';

let _client: Resend | null = null;

function getClient(): Resend | null {
  if (_client) return _client;
  if (!process.env.RESEND_API_KEY) return null;
  _client = new Resend(process.env.RESEND_API_KEY);
  return _client;
}

export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export function getFromAddress(): string {
  return process.env.EMAIL_FROM || 'WedPlan <onboarding@resend.dev>';
}

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const resend = getClient();

  if (!resend) {
    // Dev/test fallback — log intent and succeed so flows work without credentials
    console.log(`[Email:dev] To: ${payload.to} | Subject: ${payload.subject}`);
    return { success: true, messageId: `dev_${Date.now()}` };
  }

  try {
    const result = await resend.emails.send({
      from: getFromAddress(),
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    });

    if (result.error) {
      console.error('[Email] Resend error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Email] Unexpected error:', msg);
    return { success: false, error: msg };
  }
}

// ── HTML Templates ────────────────────────────────────────────────────────────

const baseStyle = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #1e293b; line-height: 1.6; max-width: 560px; margin: 0 auto; padding: 0;
`;

function wrapEmail(body: string): string {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="background:#f8fafc;padding:32px 16px;">
<div style="${baseStyle}">
  <div style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
    <div style="background:linear-gradient(135deg,#f43f5e 0%,#e11d48 100%);padding:28px 32px;">
      <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
        💍 WedPlan
      </h1>
    </div>
    <div style="padding:32px;">
      ${body}
    </div>
    <div style="border-top:1px solid #f1f5f9;padding:20px 32px;background:#fafafa;">
      <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
        WedPlan · Your wedding planning platform ·
        <a href="${process.env.NEXTAUTH_URL || 'https://wedplan.lk'}" style="color:#f43f5e;text-decoration:none;">wedplan.lk</a>
      </p>
    </div>
  </div>
</div></body></html>`;
}

export function renderInviteEmail(
  weddingTitle: string,
  guestName: string,
  rsvpLink: string,
  imageUrl?: string,
): { subject: string; html: string; text: string } {
  const subject = `You're invited to ${weddingTitle}! 💌`;
  const html = wrapEmail(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">Dear ${guestName},</h2>
    <p style="margin:0 0 20px;color:#475569;">You are warmly invited to celebrate with us at <strong>${weddingTitle}</strong>.</p>
    ${imageUrl ? `<img src="${imageUrl}" alt="Wedding invitation" style="width:100%;border-radius:8px;margin-bottom:20px;">` : ''}
    <p style="margin:0 0 24px;color:#475569;">Please let us know if you'll be joining us by responding to the invitation below.</p>
    <a href="${rsvpLink}" style="display:inline-block;background:#f43f5e;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
      Respond to Invitation →
    </a>
    <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">Or copy this link: ${rsvpLink}</p>
  `);
  const text = `Dear ${guestName},\n\nYou are warmly invited to ${weddingTitle}.\n\nPlease RSVP here: ${rsvpLink}`;
  return { subject, html, text };
}

export function renderRsvpConfirmationEmail(
  weddingTitle: string,
  guestName: string,
): { subject: string; html: string; text: string } {
  const subject = `RSVP confirmed for ${weddingTitle} 🎉`;
  const html = wrapEmail(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">Thank you, ${guestName}!</h2>
    <p style="margin:0 0 20px;color:#475569;">
      We've received your RSVP for <strong>${weddingTitle}</strong> and we're so excited to celebrate with you!
    </p>
    <div style="background:#f0fdf4;border-left:4px solid #10b981;border-radius:0 8px 8px 0;padding:16px 20px;margin-bottom:20px;">
      <p style="margin:0;color:#166534;font-weight:600;">✓ Your attendance has been confirmed</p>
    </div>
    <p style="margin:0;color:#475569;">We'll be in touch with more details as the big day approaches. See you there!</p>
  `);
  const text = `Thank you, ${guestName}! Your RSVP for ${weddingTitle} has been confirmed.`;
  return { subject, html, text };
}

export function renderReminderEmail(
  weddingTitle: string,
  guestName: string,
  rsvpLink: string,
): { subject: string; html: string; text: string } {
  const subject = `Reminder: Please RSVP for ${weddingTitle}`;
  const html = wrapEmail(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">Hi ${guestName},</h2>
    <p style="margin:0 0 20px;color:#475569;">
      Just a gentle reminder — we haven't received your RSVP for <strong>${weddingTitle}</strong> yet.
      We'd love to know if you can make it!
    </p>
    <a href="${rsvpLink}" style="display:inline-block;background:#f43f5e;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
      RSVP Now →
    </a>
    <p style="margin:24px 0 0;font-size:13px;color:#94a3b8;">Or copy this link: ${rsvpLink}</p>
  `);
  const text = `Hi ${guestName},\n\nThis is a reminder to RSVP for ${weddingTitle}: ${rsvpLink}`;
  return { subject, html, text };
}

export function renderPasswordResetEmail(
  resetUrl: string,
): { subject: string; html: string; text: string } {
  const subject = 'Reset your WedPlan password';
  const html = wrapEmail(`
    <h2 style="margin:0 0 8px;font-size:20px;color:#1e293b;">Reset your password</h2>
    <p style="margin:0 0 20px;color:#475569;">
      We received a request to reset your WedPlan account password.
      Click the button below to choose a new password. This link expires in <strong>1 hour</strong>.
    </p>
    <a href="${resetUrl}" style="display:inline-block;background:#f43f5e;color:#fff;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">
      Reset Password →
    </a>
    <p style="margin:24px 0 0;color:#94a3b8;font-size:13px;">
      If you didn't request a password reset, you can safely ignore this email.<br>
      Or copy this link: ${resetUrl}
    </p>
  `);
  const text = `Reset your WedPlan password: ${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, ignore this email.`;
  return { subject, html, text };
}
