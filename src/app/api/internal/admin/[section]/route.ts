import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/adminSession";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

const ALLOWED_SECTIONS = new Set([
  "token-pricing",
  "subscription-plans",
  "free-benefits",
  "communication",
  "emergency",
  "payment-providers",
]);

async function verifyAdmin(): Promise<boolean> {
  return verifyAdminSession();
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

  const noCacheHeaders = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
  };

  if (error) {
    return NextResponse.json(
      { [getResponseKey(section)]: getDefault(section) },
      { headers: noCacheHeaders }
    );
  }

  return NextResponse.json(
    { [getResponseKey(section)]: data.value },
    { headers: noCacheHeaders }
  );
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

  if (value === undefined || value === null) {
    return NextResponse.json(
      { error: "No data provided" },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();
  const dbKey = section.replace(/-/g, "_");

  const { data: updated, error } = await supabase
    .from("admin_settings")
    .update({ value })
    .eq("key", dbKey)
    .select("value")
    .single();

  if (error || !updated) {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, saved: updated.value });
}

function getResponseKey(section: string): string {
  const map: Record<string, string> = {
    "token-pricing": "pricing",
    "subscription-plans": "plans",
    "free-benefits": "config",
    communication: "config",
    emergency: "config",
    "payment-providers": "config",
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
    "payment-providers": {
      active_provider: "lemonsqueezy",
      payments_disabled: false,
      disabled_message: "",
      disabled_redirect: "",
    },
  };
  return defaults[section] || {};
}
