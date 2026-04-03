import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logError } from "@/lib/logger";
import { buildResetEmailHtml, sendEmailViaSendGrid } from "@/lib/email";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }
  return createClient(url, serviceKey);
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

  const htmlContent = buildResetEmailHtml(resetUrl);

  const result = await sendEmailViaSendGrid({
    to: email,
    subject: "Reset Your Password - 14DaysAccel Dev",
    html: htmlContent,
  });

  if (!result.ok) {
    console.error("[forgot-password] SendGrid error:", result.status, result.error);
    await logError({
      message: "SendGrid password reset email failed",
      source: "api",
      path: "/api/auth/forgot-password",
      details: { status: result.status, response: result.error },
    });
  }

  // Always return success to prevent email enumeration
  return NextResponse.json({ success: true });
}
