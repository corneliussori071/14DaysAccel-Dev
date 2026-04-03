import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { logError } from "@/lib/logger";
import {
  buildTicketConfirmationEmailHtml,
  sendEmailViaSendGrid,
  SUPPORT_EMAIL_FROM,
} from "@/lib/email";
import { sanitizeText, sanitizeEmail, sanitizeName } from "@/lib/sanitize";

const VALID_CATEGORIES = new Set([
  "subscriptions",
  "purchases",
  "enquiry",
  "partner_affiliate",
  "others",
]);

const CATEGORY_LABELS: Record<string, string> = {
  subscriptions: "Subscriptions",
  purchases: "Purchases",
  enquiry: "Enquiry",
  partner_affiliate: "Partner / Affiliate Program",
  others: "Others",
};

// IP-based rate limiting: 1 ticket per IP per hour
const ipLimits = new Map<string, number>();
const RATE_LIMIT_MS = 60 * 60 * 1000;

function isIpRateLimited(ip: string): boolean {
  const now = Date.now();
  const lastSubmit = ipLimits.get(ip);
  if (lastSubmit && now - lastSubmit < RATE_LIMIT_MS) {
    return true;
  }
  ipLimits.set(ip, now);
  return false;
}

function generateTicketId(): string {
  const now = new Date();
  const datePart = now.toISOString().slice(2, 10).replace(/-/g, "");
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TK-${datePart}-${randomPart}`;
}

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

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    if (isIpRateLimited(ip)) {
      return NextResponse.json(
        { error: "You can only submit one ticket per hour. Please try again later." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { name: rawName, email: rawEmail, category, description: rawDescription } = body;

    // Sanitize inputs
    const name = sanitizeName(rawName);
    if (!name) {
      return NextResponse.json(
        { error: "A valid name is required." },
        { status: 400 }
      );
    }

    const email = sanitizeEmail(rawEmail);
    if (!email) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!category || !VALID_CATEGORIES.has(category)) {
      return NextResponse.json(
        { error: "Please select a valid category." },
        { status: 400 }
      );
    }

    const description = sanitizeText(rawDescription);
    if (!description || description.length < 10) {
      return NextResponse.json(
        { error: "Description must be at least 10 characters." },
        { status: 400 }
      );
    }
    if (description.length > 500) {
      return NextResponse.json(
        { error: "Description must not exceed 500 characters." },
        { status: 400 }
      );
    }

    const ticketId = generateTicketId();
    const supabase = getSupabaseAdmin();

    const { error: insertError } = await supabase
      .from("support_tickets")
      .insert({
        id: ticketId,
        name,
        email,
        category,
        description,
        status: "open",
        ip_address: ip,
      });

    if (insertError) {
      await logError({
        message: "Failed to create support ticket",
        source: "api",
        path: "/api/tickets",
        details: { error: insertError.message },
      });
      return NextResponse.json(
        { error: "Failed to create ticket. Please try again." },
        { status: 500 }
      );
    }

    // Send confirmation email
    const htmlContent = buildTicketConfirmationEmailHtml(
      ticketId,
      CATEGORY_LABELS[category] || category
    );

    const emailResult = await sendEmailViaSendGrid({
      to: email,
      subject: `Support Ticket ${ticketId} Created - 14DaysAccel Dev`,
      html: htmlContent,
      from: SUPPORT_EMAIL_FROM,
    });

    if (!emailResult.ok) {
      await logError({
        message: "Failed to send ticket confirmation email",
        source: "api",
        path: "/api/tickets",
        details: { ticketId, status: emailResult.status, error: emailResult.error },
      });
    }

    return NextResponse.json({ ticketId });
  } catch (err) {
    console.error("[tickets] Error:", err);
    await logError({
      message: "Ticket creation route failed",
      source: "api",
      path: "/api/tickets",
      details: { error: err instanceof Error ? err.message : "Unknown error" },
    });
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}
