import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/software-designer";

  // Handle OAuth error responses from Supabase Auth
  const oauthError = searchParams.get("error");
  const oauthErrorDescription = searchParams.get("error_description");
  if (oauthError) {
    const errorMessage = oauthErrorDescription || oauthError;
    console.error("[auth/callback] OAuth error:", oauthError, oauthErrorDescription);
    const errorRedirect = new URL(next, origin);
    errorRedirect.searchParams.set("auth_error", errorMessage);
    return NextResponse.redirect(errorRedirect);
  }

  if (code) {
    const redirectUrl = `${origin}${next}`;
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("[auth/callback] Code exchange failed:", error.message);
      const errorRedirect = new URL(next, origin);
      errorRedirect.searchParams.set("auth_error", error.message);
      return NextResponse.redirect(errorRedirect);
    }

    // Block new OAuth signups when signups are disabled
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceKey) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const createdAt = new Date(user.created_at).getTime();
          const isNewUser = Date.now() - createdAt < 60_000;

          if (isNewUser) {
            const adminClient = createClient(supabaseUrl, serviceKey, {
              auth: { autoRefreshToken: false, persistSession: false },
            });
            const { data: settings } = await adminClient
              .from("admin_settings")
              .select("value")
              .eq("key", "emergency")
              .single();

            if (settings?.value?.signups_disabled) {
              await adminClient.auth.admin.deleteUser(user.id);
              await supabase.auth.signOut();
              const errorRedirect = new URL(next, origin);
              errorRedirect.searchParams.set(
                "auth_error",
                "New account registration is temporarily disabled. Please try again later."
              );
              return NextResponse.redirect(errorRedirect);
            }
          }

          // Flag new signups so the client can track with Affonso
          if (isNewUser) {
            const redirectWithSignup = new URL(redirectUrl);
            redirectWithSignup.searchParams.set("new_signup", "true");
            return NextResponse.redirect(redirectWithSignup, { headers: response.headers });
          }
        }
      } catch (e) {
        console.error("[auth/callback] Signup check failed:", e);
      }
    }

    return response;
  }

  console.error("[auth/callback] No code or error parameter received");
  const fallback = new URL(next, origin);
  fallback.searchParams.set("auth_error", "Authentication failed. Please try again.");
  return NextResponse.redirect(fallback);
}
