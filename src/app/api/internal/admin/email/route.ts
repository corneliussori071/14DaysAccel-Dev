import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }
  return createClient(url, serviceKey);
}

async function verifyAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;
    const decoded = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (decoded.role !== "admin") return false;
    if (Date.now() > decoded.exp) return false;
    return true;
  } catch {
    return false;
  }
}

const EMAIL_CATEGORIES = [
  "welcome",
  "notification",
  "low_token",
  "transaction",
  "maintenance",
  "custom",
] as const;

type EmailCategory = (typeof EMAIL_CATEGORIES)[number];

function buildEmailHtml(subject: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e4e4e7;">
          <!-- Header -->
          <tr>
            <td style="background-color:#18181b;padding:24px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:18px;font-weight:600;letter-spacing:-0.02em;">14DaysAccel Dev</h1>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 16px;color:#18181b;font-size:20px;font-weight:600;">${subject}</h2>
              <div style="color:#3f3f46;font-size:14px;line-height:1.7;">
                ${body.replace(/\n/g, "<br />")}
              </div>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="border-top:1px solid #e4e4e7;padding:24px 32px;background-color:#fafafa;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="color:#71717a;font-size:12px;line-height:1.6;">
                    <p style="margin:0 0 4px;font-weight:600;color:#52525b;">14DaysAccel Dev</p>
                    <p style="margin:0;">You are receiving this email because you have an account with 14DaysAccel Dev.</p>
                    <p style="margin:8px 0 0;color:#a1a1aa;">If you have questions, contact our support team.</p>
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

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();

  // Fetch recent email log
  const { data, error } = await supabase
    .from("admin_email_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: "Failed to fetch email log" }, { status: 500 });
  }

  return NextResponse.json({ emails: data || [] });
}

export async function POST(request: NextRequest) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { subject, emailBody, category, recipientIds } = body;

  if (!subject?.trim() || !emailBody?.trim()) {
    return NextResponse.json(
      { error: "Subject and body are required" },
      { status: 400 }
    );
  }

  if (!category || !EMAIL_CATEGORIES.includes(category as EmailCategory)) {
    return NextResponse.json(
      { error: "Invalid email category" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Resolve recipients
  let recipientEmails: string[] = [];

  if (!recipientIds || recipientIds.length === 0 || recipientIds[0] === "all") {
    // Send to all users
    const { data: authData, error: authError } =
      await supabase.auth.admin.listUsers({ page: 1, perPage: 10000 });
    if (authError) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
    recipientEmails = (authData.users || [])
      .map((u) => u.email)
      .filter((e): e is string => !!e);
  } else {
    // Send to specific users by ID
    const { data: authData, error: authError } =
      await supabase.auth.admin.listUsers({ page: 1, perPage: 10000 });
    if (authError) {
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
    }
    const idSet = new Set(recipientIds as string[]);
    recipientEmails = (authData.users || [])
      .filter((u) => idSet.has(u.id))
      .map((u) => u.email)
      .filter((e): e is string => !!e);
  }

  if (recipientEmails.length === 0) {
    return NextResponse.json(
      { error: "No valid recipients found" },
      { status: 400 }
    );
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM || "noreply@14daysaccel.dev";
  const htmlContent = buildEmailHtml(subject, emailBody);

  let sentCount = 0;
  const errors: string[] = [];

  if (resendApiKey) {
    // Send via Resend API
    for (const email of recipientEmails) {
      try {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: `14DaysAccel Dev <${fromEmail}>`,
            to: [email],
            subject,
            html: htmlContent,
          }),
        });
        if (res.ok) {
          sentCount++;
        } else {
          const errData = await res.json().catch(() => ({}));
          errors.push(`${email}: ${errData.message || res.statusText}`);
        }
      } catch (err) {
        errors.push(`${email}: ${err instanceof Error ? err.message : "Send failed"}`);
      }
    }
  } else {
    // No email provider configured — log only
    sentCount = recipientEmails.length;
  }

  // Log to database
  await supabase.from("admin_email_log").insert({
    subject,
    body: emailBody,
    category,
    recipient_count: sentCount,
    sent_by: "admin",
  });

  return NextResponse.json({
    success: true,
    sent: sentCount,
    total: recipientEmails.length,
    errors: errors.length > 0 ? errors : undefined,
    provider: resendApiKey ? "resend" : "log_only",
  });
}
