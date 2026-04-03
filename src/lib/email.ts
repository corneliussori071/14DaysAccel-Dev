const AFFILIATE_LINK = "https://14daysaccel.com/partners";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function footerHtml(): string {
  return `<tr>
  <td style="border-top:1px solid #e4e4e7;padding:24px 32px;background-color:#fafafa;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="color:#71717a;font-size:12px;line-height:1.6;">
          <p style="margin:0 0 4px;font-weight:600;color:#52525b;">14DaysAccel Dev</p>
          <p style="margin:0 0 12px;">This is an automated message. Please do not reply to this email.</p>
          <p style="margin:0;">
            <a href="https://14daysaccel.com" style="color:#3b82f6;text-decoration:none;">Website</a>
            &nbsp;&middot;&nbsp;
            <a href="https://14daysaccel.com/projects" style="color:#3b82f6;text-decoration:none;">Projects</a>
            &nbsp;&middot;&nbsp;
            <a href="${AFFILIATE_LINK}" style="color:#3b82f6;text-decoration:none;">Partner Program</a>
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

function headerHtml(): string {
  return `<tr>
  <td style="background-color:#18181b;padding:24px 32px;">
    <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;letter-spacing:-0.02em;">14DaysAccel Dev</h1>
  </td>
</tr>`;
}

function wrapEmail(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(title)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">
          ${headerHtml()}
          <tr>
            <td style="padding:32px;">
              ${bodyHtml}
            </td>
          </tr>
          ${footerHtml()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function buildConfirmationEmailHtml(confirmUrl: string, signupTokens: number = 1000): string {
  const formattedTokens = signupTokens.toLocaleString();
  const body = `<h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:600;">Confirm Your Email</h2>
<div style="color:#3f3f46;font-size:14px;line-height:1.7;">
  <p style="margin:0 0 16px;">Welcome to 14DaysAccel Dev. Click the button below to confirm your email address and activate your account.</p>
  <p style="margin:0 0 24px;">You will receive ${formattedTokens} free tokens to get started with our AI-powered software planning tools.</p>
</div>
<table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
  <tr>
    <td style="background-color:#18181b;border-radius:6px;padding:12px 28px;">
      <a href="${confirmUrl}" style="color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;display:inline-block;">Confirm Email Address</a>
    </td>
  </tr>
</table>
<div style="color:#71717a;font-size:13px;line-height:1.6;">
  <p style="margin:0 0 8px;">If the button does not work, copy and paste this link into your browser:</p>
  <p style="margin:0;word-break:break-all;color:#3b82f6;">${confirmUrl}</p>
</div>
<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e4e4e7;">
  <p style="margin:0 0 8px;color:#18181b;font-size:14px;font-weight:600;">Earn with our Partner Program</p>
  <p style="margin:0 0 12px;color:#3f3f46;font-size:13px;line-height:1.6;">
    Join our affiliate program and earn 30% commission on every referral, including recurring subscriptions. Share your link, track your earnings, and get paid.
  </p>
  <table cellpadding="0" cellspacing="0">
    <tr>
      <td style="border:1px solid #e4e4e7;border-radius:6px;padding:8px 20px;">
        <a href="${AFFILIATE_LINK}" style="color:#18181b;font-size:13px;font-weight:500;text-decoration:none;display:inline-block;">Learn More</a>
      </td>
    </tr>
  </table>
</div>`;

  return wrapEmail("Confirm Your Email - 14DaysAccel Dev", body);
}

export function buildResetEmailHtml(resetUrl: string): string {
  const body = `<h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:600;">Password Reset Request</h2>
<div style="color:#3f3f46;font-size:14px;line-height:1.7;">
  <p style="margin:0 0 16px;">We received a request to reset the password for your 14DaysAccel Dev account.</p>
  <p style="margin:0 0 24px;">Click the button below to set a new password. This link will expire in 1 hour.</p>
</div>
<table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
  <tr>
    <td style="background-color:#18181b;border-radius:6px;padding:12px 28px;">
      <a href="${resetUrl}" style="color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;display:inline-block;">Reset Password</a>
    </td>
  </tr>
</table>
<div style="color:#71717a;font-size:13px;line-height:1.6;">
  <p style="margin:0 0 8px;">If the button does not work, copy and paste this link into your browser:</p>
  <p style="margin:0;word-break:break-all;color:#3b82f6;">${resetUrl}</p>
</div>
<div style="margin-top:24px;padding-top:16px;border-top:1px solid #e4e4e7;color:#a1a1aa;font-size:12px;line-height:1.6;">
  <p style="margin:0;">If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
</div>`;

  return wrapEmail("Reset Your Password - 14DaysAccel Dev", body);
}

export const AUTH_EMAIL_FROM = {
  email: "no-reply-registration@14daysaccel.dev",
  name: "14DaysAccel Dev",
};

export async function sendEmailViaSendGrid(params: {
  to: string;
  subject: string;
  html: string;
  from?: { email: string; name: string };
}): Promise<{ ok: boolean; status?: number; error?: string }> {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  if (!sendgridApiKey) {
    return { ok: false, error: "SENDGRID_API_KEY not configured" };
  }

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sendgridApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: params.to }] }],
      from: params.from || AUTH_EMAIL_FROM,
      subject: params.subject,
      content: [{ type: "text/html", value: params.html }],
    }),
  });

  if (res.status < 200 || res.status >= 300) {
    const errText = await res.text().catch(() => res.statusText);
    return { ok: false, status: res.status, error: errText };
  }

  return { ok: true };
}

export const SUPPORT_EMAIL_FROM = {
  email: "support@14daysaccel.dev",
  name: "14DaysAccel Dev",
};

export function buildTicketConfirmationEmailHtml(ticketId: string, category: string): string {
  const body = `<h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:600;">Support Ticket Created</h2>
<div style="color:#3f3f46;font-size:14px;line-height:1.7;">
  <p style="margin:0 0 16px;">Your support ticket has been created. Our team will review it and respond as soon as possible.</p>
  <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;width:100%;">
    <tr>
      <td style="padding:12px 16px;background-color:#fafafa;border-bottom:1px solid #e4e4e7;font-size:13px;color:#71717a;width:120px;">Ticket ID</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;font-size:14px;font-weight:600;color:#18181b;font-family:monospace;">${escapeHtml(ticketId)}</td>
    </tr>
    <tr>
      <td style="padding:12px 16px;background-color:#fafafa;font-size:13px;color:#71717a;">Category</td>
      <td style="padding:12px 16px;font-size:14px;color:#18181b;">${escapeHtml(category)}</td>
    </tr>
  </table>
  <p style="margin:0 0 8px;">Please reference this ticket ID in any future communication regarding this issue:</p>
  <p style="margin:0;padding:10px 16px;background-color:#f4f4f5;border-radius:4px;font-family:monospace;font-size:15px;font-weight:600;color:#18181b;">${escapeHtml(ticketId)}</p>
</div>`;

  return wrapEmail("Support Ticket Created - 14DaysAccel Dev", body);
}

export function buildTicketReplyEmailHtml(ticketId: string, replyMessage: string): string {
  const body = `<h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:600;">New Reply on Your Ticket</h2>
<div style="color:#3f3f46;font-size:14px;line-height:1.7;">
  <p style="margin:0 0 8px;color:#71717a;font-size:13px;">Ticket ID: <span style="font-family:monospace;font-weight:600;color:#18181b;">${escapeHtml(ticketId)}</span></p>
  <div style="margin:16px 0 24px;padding:16px;background-color:#fafafa;border:1px solid #e4e4e7;border-radius:6px;">
    <p style="margin:0;white-space:pre-wrap;">${escapeHtml(replyMessage)}</p>
  </div>
  <p style="margin:0;color:#71717a;font-size:13px;">Please reference your ticket ID <strong>${escapeHtml(ticketId)}</strong> in any future communication.</p>
</div>`;

  return wrapEmail("Reply on Ticket " + escapeHtml(ticketId) + " - 14DaysAccel Dev", body);
}

export function buildTicketStatusEmailHtml(ticketId: string, newStatus: "open" | "closed"): string {
  const statusLabel = newStatus === "closed" ? "Closed" : "Re-opened";
  const statusColor = newStatus === "closed" ? "#dc2626" : "#16a34a";
  const body = `<h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:600;">Ticket ${statusLabel}</h2>
<div style="color:#3f3f46;font-size:14px;line-height:1.7;">
  <p style="margin:0 0 16px;">Your support ticket has been <span style="font-weight:600;color:${statusColor};">${statusLabel.toLowerCase()}</span>.</p>
  <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;border:1px solid #e4e4e7;border-radius:6px;overflow:hidden;width:100%;">
    <tr>
      <td style="padding:12px 16px;background-color:#fafafa;border-bottom:1px solid #e4e4e7;font-size:13px;color:#71717a;width:120px;">Ticket ID</td>
      <td style="padding:12px 16px;border-bottom:1px solid #e4e4e7;font-size:14px;font-weight:600;color:#18181b;font-family:monospace;">${escapeHtml(ticketId)}</td>
    </tr>
    <tr>
      <td style="padding:12px 16px;background-color:#fafafa;font-size:13px;color:#71717a;">Status</td>
      <td style="padding:12px 16px;font-size:14px;font-weight:600;color:${statusColor};">${statusLabel}</td>
    </tr>
  </table>
  <p style="margin:0;color:#71717a;font-size:13px;">Please reference your ticket ID <strong>${escapeHtml(ticketId)}</strong> in any future communication.</p>
</div>`;

  return wrapEmail("Ticket " + statusLabel + " - 14DaysAccel Dev", body);
}
