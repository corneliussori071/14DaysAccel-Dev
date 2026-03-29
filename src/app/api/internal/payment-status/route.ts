import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }
  return createClient(url, serviceKey);
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "payment_providers")
      .single();

    const config = data?.value as {
      payments_disabled?: boolean;
      disabled_message?: string;
      disabled_redirect?: string;
    } | null;

    if (config?.payments_disabled) {
      return NextResponse.json(
        {
          disabled: true,
          message: config.disabled_message || "Payments are temporarily unavailable.",
          redirect: config.disabled_redirect || null,
        },
        {
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
            Pragma: "no-cache",
          },
        }
      );
    }

    return NextResponse.json(
      { disabled: false },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch {
    return NextResponse.json({ disabled: false });
  }
}
