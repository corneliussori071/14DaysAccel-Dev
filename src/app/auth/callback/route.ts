import { createServerClient } from "@supabase/ssr";
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
    if (!error) {
      return response;
    }

    console.error("[auth/callback] Code exchange failed:", error.message);
    const errorRedirect = new URL(next, origin);
    errorRedirect.searchParams.set("auth_error", error.message);
    return NextResponse.redirect(errorRedirect);
  }

  console.error("[auth/callback] No code or error parameter received");
  const fallback = new URL(next, origin);
  fallback.searchParams.set("auth_error", "Authentication failed. Please try again.");
  return NextResponse.redirect(fallback);
}
