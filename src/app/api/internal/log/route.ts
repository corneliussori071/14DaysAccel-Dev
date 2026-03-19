import { NextRequest, NextResponse } from "next/server";
import { logError, logWarn, logCritical } from "@/lib/logger";

const VALID_LEVELS = new Set(["warn", "error", "critical"]);

// Basic in-memory rate limiting per IP (max 20 logs per minute)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  let body: { level?: string; message?: string; details?: Record<string, unknown>; path?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { level, message, details, path } = body;

  if (!message || typeof message !== "string" || !message.trim()) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 }
    );
  }

  const logLevel = VALID_LEVELS.has(level || "") ? level! : "error";
  const safeMessage = message.slice(0, 2000);
  const entry = {
    message: safeMessage,
    source: "client",
    details: details && typeof details === "object" ? details : undefined,
    path: typeof path === "string" ? path.slice(0, 500) : undefined,
  };

  if (logLevel === "critical") {
    await logCritical(entry);
  } else if (logLevel === "warn") {
    await logWarn(entry);
  } else {
    await logError(entry);
  }

  return NextResponse.json({ ok: true });
}
