import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { verifyAdminSession } from "@/lib/adminSession";
import {
  buildTicketReplyEmailHtml,
  buildTicketStatusEmailHtml,
  sendEmailViaSendGrid,
  SUPPORT_EMAIL_FROM,
} from "@/lib/email";
import { logError } from "@/lib/logger";

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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();

  const [repliesResult, activityResult] = await Promise.all([
    supabase
      .from("ticket_replies")
      .select("id, ticket_id, message, admin_name, created_at")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true }),
    supabase
      .from("ticket_activity")
      .select("id, ticket_id, action, admin_name, details, created_at")
      .eq("ticket_id", id)
      .order("created_at", { ascending: true }),
  ]);

  if (repliesResult.error || activityResult.error) {
    return NextResponse.json({ error: "Failed to load ticket details" }, { status: 500 });
  }

  return NextResponse.json({
    replies: repliesResult.data || [],
    activity: activityResult.data || [],
  });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status, adminName } = body;
  const staffName = typeof adminName === "string" && adminName.trim() ? adminName.trim().slice(0, 100) : "Admin";

  if (!status || !["open", "closed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Get ticket to find email
  const { data: ticket, error: fetchError } = await supabase
    .from("support_tickets")
    .select("email, status")
    .eq("id", id)
    .single();

  if (fetchError || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  if (ticket.status === status) {
    return NextResponse.json({ error: `Ticket is already ${status}` }, { status: 400 });
  }

  const { error: updateError } = await supabase
    .from("support_tickets")
    .update({ status })
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Log activity
  await supabase.from("ticket_activity").insert({
    ticket_id: id,
    action: "status_changed",
    admin_name: staffName,
    details: status === "closed" ? "Closed the ticket" : "Re-opened the ticket",
  });

  // Send status change email
  const htmlContent = buildTicketStatusEmailHtml(id, status);
  const emailResult = await sendEmailViaSendGrid({
    to: ticket.email,
    subject: `Ticket ${id} ${status === "closed" ? "Closed" : "Re-opened"} - 14DaysAccel Dev`,
    html: htmlContent,
    from: SUPPORT_EMAIL_FROM,
  });

  if (!emailResult.ok) {
    await logError({
      message: "Failed to send ticket status email",
      source: "api",
      path: `/api/internal/admin/tickets/${id}`,
      details: { ticketId: id, status: emailResult.status, error: emailResult.error },
    });
  }

  return NextResponse.json({ success: true });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { message, adminName } = body;
  const staffName = typeof adminName === "string" && adminName.trim() ? adminName.trim().slice(0, 100) : "Admin";

  if (!message || typeof message !== "string" || message.trim().length < 1) {
    return NextResponse.json({ error: "Reply message is required" }, { status: 400 });
  }

  const trimmedMessage = message.trim().slice(0, 2000);
  const supabase = getSupabaseAdmin();

  // Get ticket email
  const { data: ticket, error: fetchError } = await supabase
    .from("support_tickets")
    .select("email")
    .eq("id", id)
    .single();

  if (fetchError || !ticket) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  // Insert reply with admin name
  const { error: insertError } = await supabase
    .from("ticket_replies")
    .insert({ ticket_id: id, message: trimmedMessage, admin_name: staffName });

  if (insertError) {
    return NextResponse.json({ error: insertError.message }, { status: 500 });
  }

  // Log activity
  await supabase.from("ticket_activity").insert({
    ticket_id: id,
    action: "replied",
    admin_name: staffName,
    details: trimmedMessage,
  });

  // Send reply email
  const htmlContent = buildTicketReplyEmailHtml(id, trimmedMessage);
  const emailResult = await sendEmailViaSendGrid({
    to: ticket.email,
    subject: `Reply on Ticket ${id} - 14DaysAccel Dev`,
    html: htmlContent,
    from: SUPPORT_EMAIL_FROM,
  });

  if (!emailResult.ok) {
    await logError({
      message: "Failed to send ticket reply email",
      source: "api",
      path: `/api/internal/admin/tickets/${id}`,
      details: { ticketId: id, status: emailResult.status, error: emailResult.error },
    });
  }

  return NextResponse.json({ success: true });
}
