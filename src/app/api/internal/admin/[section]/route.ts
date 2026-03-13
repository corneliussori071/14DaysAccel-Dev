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

const ALLOWED_SECTIONS = new Set([
  "token-pricing",
  "subscription-plans",
  "free-benefits",
  "communication",
  "emergency",
]);

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { section } = await params;

  if (!ALLOWED_SECTIONS.has(section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const dbKey = section.replace(/-/g, "_");

  const { data, error } = await supabase
    .from("admin_settings")
    .select("value")
    .eq("key", dbKey)
    .single();

  if (error) {
    return NextResponse.json({ [getResponseKey(section)]: getDefault(section) });
  }

  return NextResponse.json({ [getResponseKey(section)]: data.value });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { section } = await params;

  if (!ALLOWED_SECTIONS.has(section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 400 });
  }

  const body = await request.json();
  const value = body[getResponseKey(section)] ?? body.config ?? body.pricing ?? body.plans;

  const supabase = getSupabaseAdmin();
  const dbKey = section.replace(/-/g, "_");

  const { error } = await supabase
    .from("admin_settings")
    .upsert({ key: dbKey, value }, { onConflict: "key" });

  if (error) {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}

function getResponseKey(section: string): string {
  const map: Record<string, string> = {
    "token-pricing": "pricing",
    "subscription-plans": "plans",
    "free-benefits": "config",
    communication: "config",
    emergency: "config",
  };
  return map[section] || "config";
}

function getDefault(section: string): unknown {
  const defaults: Record<string, unknown> = {
    "token-pricing": [],
    "subscription-plans": [],
    "free-benefits": {
      free_tokens_on_signup: 1000,
      free_trial_days: 14,
      trial_token_limit: 5000,
      is_free_trial_active: true,
    },
    communication: {
      support_email: "",
      notification_email_enabled: true,
      welcome_email_enabled: true,
      low_token_alert_threshold: 100,
      low_token_alert_enabled: true,
    },
    emergency: {
      maintenance_mode: false,
      maintenance_message: "",
      ai_services_disabled: false,
      signups_disabled: false,
      disable_reason: "",
    },
  };
  return defaults[section] || {};
}
