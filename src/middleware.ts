import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const ADMIN_PATHS = ["/sys/gate", "/sys/panel", "/api/internal/auth", "/api/internal/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never block admin routes, static assets, or auth callback
  if (
    ADMIN_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/auth/callback") ||
    pathname.match(/\.\w+$/)
  ) {
    return NextResponse.next();
  }

  // Refresh the Supabase auth session on every request (cookie-based)
  let response = NextResponse.next({ request });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    await supabase.auth.getUser();
  }

  // Check maintenance mode from Supabase
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    return response;
  }

  try {
    const supabaseService = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) =>
          fetch(input, { ...init, cache: "no-store" }),
      },
    });
    const { data } = await supabaseService
      .from("admin_settings")
      .select("value")
      .eq("key", "emergency")
      .single();

    const config = data?.value;
    if (config?.maintenance_mode) {
      const maintenanceMessage =
        config.maintenance_message ||
        "We are performing scheduled maintenance. Please check back soon.";

      return new NextResponse(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Maintenance - 14DaysAccel Dev</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #fafafa;
      color: #18181b;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }
    .container {
      max-width: 480px;
      text-align: center;
    }
    h1 {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 12px;
      letter-spacing: -0.02em;
    }
    p {
      color: #71717a;
      font-size: 15px;
      line-height: 1.6;
    }
    .brand {
      margin-top: 32px;
      font-size: 13px;
      color: #a1a1aa;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Under Maintenance</h1>
    <p>${maintenanceMessage.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
    <p class="brand">14DaysAccel Dev</p>
  </div>
</body>
</html>`,
        {
          status: 503,
          headers: { "Content-Type": "text/html; charset=utf-8", "Retry-After": "300" },
        }
      );
    }
  } catch {
    // If we can't check maintenance status, allow the request through
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
