import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ enabled: true });
  }

  try {
    const supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, cache: "no-store" }),
      },
    });

    const { data } = await supabase
      .from("admin_settings")
      .select("value")
      .eq("key", "emergency")
      .single();

    const disabled = data?.value?.ai_services_disabled === true;

    return NextResponse.json(
      { enabled: !disabled },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch {
    return NextResponse.json({ enabled: true });
  }
}
