import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.json({ allowed: true });
  }

  try {
    const supabase = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const [{ data: emergencyData }, { data: benefitsData }] = await Promise.all([
      supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "emergency")
        .single(),
      supabase
        .from("admin_settings")
        .select("value")
        .eq("key", "free_benefits")
        .single(),
    ]);

    const signupsDisabled = emergencyData?.value?.signups_disabled === true;
    const signupTokens = benefitsData?.value?.free_tokens_on_signup ?? 1000;

    return NextResponse.json(
      { allowed: !signupsDisabled, signupTokens: Number(signupTokens) },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch {
    return NextResponse.json({ allowed: true, signupTokens: 1000 });
  }
}
