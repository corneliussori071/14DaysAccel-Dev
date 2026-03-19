import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logError } from "@/lib/logger";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }
  return createClient(url, serviceKey);
}

function buildResetEmailHtml(resetUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Reset Your Password</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr>
            <td style="background-color:#18181b;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;letter-spacing:-0.02em;">14DaysAccel Dev</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:600;">Password Reset Request</h2>
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
              </div>
            </td>
          </tr>
          <tr>
            <td style="border-top:1px solid #e4e4e7;padding:24px 32px;background-color:#fafafa;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#71717a;font-size:12px;line-height:1.6;">
                    <p style="margin:0 0 4px;font-weight:600;color:#52525b;">14DaysAccel Dev</p>
                    <p style="margin:0;">This is an automated message. Please do not reply to this email.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, redirectTo } = body;

  if (!email?.trim()) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Generate a password reset link via Supabase Admin API (does not send email)
  const { data: linkData, error: linkError } =
    await supabase.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: redirectTo || undefined,
      },
    });

  if (linkError) {
    // Return generic message to prevent email enumeration
    return NextResponse.json({ success: true });
  }

  // Use the action_link returned by Supabase Admin API
  const resetUrl = linkData.properties?.action_link;

  if (!resetUrl) {
    return NextResponse.json({ success: true });
  }

  // Send via SendGrid
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  if (!sendgridApiKey) {
    console.error("[forgot-password] SENDGRID_API_KEY not configured");
    await logError({
      message: "SENDGRID_API_KEY not configured for password reset",
      source: "api",
      path: "/api/auth/forgot-password",
    });
    return NextResponse.json({ success: true });
  }

  const htmlContent = buildResetEmailHtml(resetUrl);

  const sgResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${sendgridApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email }] }],
      from: {
        email: "support@14daysaccel.dev",
        name: "14DaysAccel Dev",
      },
      subject: "Reset Your Password - 14DaysAccel Dev",
      content: [{ type: "text/html", value: htmlContent }],
    }),
  });

  if (sgResponse.status < 200 || sgResponse.status >= 300) {
    const errText = await sgResponse.text().catch(() => sgResponse.statusText);
    console.error(
      "[forgot-password] SendGrid error:",
      sgResponse.status,
      errText
    );
    await logError({
      message: "SendGrid password reset email failed",
      source: "api",
      path: "/api/auth/forgot-password",
      details: { status: sgResponse.status, response: errText },
    });
  }

  // Always return success to prevent email enumeration
  return NextResponse.json({ success: true });
}
