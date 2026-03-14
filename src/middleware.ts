import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const ADMIN_PATHS = ["/sys/gate", "/sys/panel", "/api/internal/auth", "/api/internal/admin"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Never block admin routes or static assets
  if (
    ADMIN_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.\w+$/)
  ) {
    return NextResponse.next();
  }

  // Check maintenance mode from Supabase
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    return NextResponse.next();
  }

  try {
    const supabase = createClient(url, serviceKey, {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
