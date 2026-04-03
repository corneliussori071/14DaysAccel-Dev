import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logError } from "@/lib/logger";
import {
  buildConfirmationEmailHtml,
  sendEmailViaSendGrid,
} from "@/lib/email";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }
  return createClient(url, serviceKey);
}

// In-memory rate limiting: 3 signup attempts per email per 15 minutes
const signupAttempts = new Map<string, { count: number; resetAt: number }>();
const SIGNUP_LIMIT = 3;
const SIGNUP_WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(email: string): boolean {
  const now = Date.now();
  const key = email.toLowerCase().trim();
  const entry = signupAttempts.get(key);

  if (!entry || now > entry.resetAt) {
    signupAttempts.set(key, { count: 1, resetAt: now + SIGNUP_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > SIGNUP_LIMIT;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, redirectTo } = body;

    if (!email?.trim() || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (isRateLimited(email)) {
      return NextResponse.json(
        { error: "Too many signup attempts. Please try again later." },
        { status: 429 }
      );
    }

    const supabase = getSupabaseAdmin();

    // Check if signups are disabled
    const { data: emergencySettings } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "emergency")
      .single();

    if (emergencySettings?.value?.signups_disabled) {
      return NextResponse.json(
        { error: "New account registration is temporarily disabled. Please try again later." },
        { status: 403 }
      );
    }

    // Create user without auto-confirming email
    const { data: userData, error: createError } =
      await supabase.auth.admin.createUser({
        email: email.trim(),
        password,
        email_confirm: false,
      });

    if (createError) {
      // User already exists
      if (
        createError.message.includes("already been registered") ||
        createError.message.includes("already exists")
      ) {
        // Return generic success to prevent email enumeration
        return NextResponse.json({ success: true });
      }
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      );
    }

    // Generate a confirmation link (does not send email)
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "signup",
        email: email.trim(),
        password,
        options: {
          redirectTo: redirectTo || undefined,
        },
      });

    if (linkError || !linkData?.properties?.action_link) {
      // User was created but link generation failed — log and still return success
      await logError({
        message: "Failed to generate confirmation link after user creation",
        source: "api",
        path: "/api/auth/signup",
        details: {
          userId: userData.user?.id,
          error: linkError?.message,
        },
      });
      return NextResponse.json({ success: true });
    }

    // Read configured signup tokens for the email
    let signupTokens = 1000;
    const { data: benefitsSettings } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "free_benefits")
      .single();
    if (benefitsSettings?.value?.free_tokens_on_signup != null) {
      signupTokens = Number(benefitsSettings.value.free_tokens_on_signup);
    }

    const confirmUrl = linkData.properties.action_link;
    const htmlContent = buildConfirmationEmailHtml(confirmUrl, signupTokens);

    const result = await sendEmailViaSendGrid({
      to: email.trim(),
      subject: "Confirm Your Email - 14DaysAccel Dev",
      html: htmlContent,
    });

    if (!result.ok) {
      console.error("[signup] SendGrid error:", result.status, result.error);
      await logError({
        message: "SendGrid signup confirmation email failed",
        source: "api",
        path: "/api/auth/signup",
        details: { status: result.status, response: result.error },
      });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[signup] Error:", err);
    await logError({
      message: "Signup route failed",
      source: "api",
      path: "/api/auth/signup",
      details: { error: err instanceof Error ? err.message : "Unknown error" },
    });
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
