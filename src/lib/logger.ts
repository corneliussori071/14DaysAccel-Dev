import { createClient } from "@supabase/supabase-js";

type LogLevel = "info" | "warn" | "error" | "critical";

interface LogEntry {
  message: string;
  source?: string;
  details?: Record<string, unknown>;
  path?: string;
  userId?: string;
}

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function scrubSensitive(details: Record<string, unknown>): Record<string, unknown> {
  const sensitive = ["authorization", "api_key", "apikey", "secret", "password", "token", "cookie"];
  const scrubbed: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(details)) {
    if (sensitive.some((s) => key.toLowerCase().includes(s))) {
      scrubbed[key] = "[REDACTED]";
    } else if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      scrubbed[key] = scrubSensitive(value as Record<string, unknown>);
    } else {
      scrubbed[key] = value;
    }
  }
  return scrubbed;
}

async function writeLog(level: LogLevel, entry: LogEntry) {
  const supabase = getServiceClient();
  if (!supabase) {
    console.error(`[logger] No service client — ${level}: ${entry.message}`);
    return;
  }

  const safeDetails = entry.details ? scrubSensitive(entry.details) : undefined;

  const { error } = await supabase.from("system_logs").insert({
    level,
    source: entry.source || "server",
    message: entry.message,
    details: safeDetails || null,
    path: entry.path || null,
    user_id: entry.userId || null,
  });

  if (error) {
    console.error(`[logger] Failed to write ${level} log:`, error.message);
  }

  if (level === "critical") {
    await sendCriticalAlert(entry.message, safeDetails);
  }
}

async function sendCriticalAlert(
  message: string,
  details?: Record<string, unknown>
) {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  if (!sendgridApiKey) {
    console.error("[logger] SENDGRID_API_KEY not set — skipping critical alert email");
    return;
  }

  const detailsBlock = details
    ? `<pre style="background:#f4f4f5;padding:16px;border-radius:6px;font-size:13px;overflow-x:auto;">${JSON.stringify(details, null, 2)}</pre>`
    : "";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:8px;border:1px solid #e4e4e7;">
        <tr><td style="background:#dc2626;padding:24px 32px;">
          <h1 style="margin:0;color:#fff;font-size:18px;">Critical Error Alert</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="margin:0 0 16px;color:#18181b;font-size:16px;font-weight:600;">${message}</p>
          ${detailsBlock}
          <p style="margin:16px 0 0;color:#71717a;font-size:12px;">Timestamp: ${new Date().toISOString()}</p>
        </td></tr>
        <tr><td style="border-top:1px solid #e4e4e7;padding:16px 32px;background:#fafafa;">
          <p style="margin:0;color:#71717a;font-size:12px;">14DaysAccel Dev — System Monitor</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: "devsaleforbussiness@gmail.com" }] }],
        from: { email: "support@14daysaccel.dev", name: "14DaysAccel Dev Alerts" },
        subject: `[CRITICAL] ${message}`,
        content: [{ type: "text/html", value: html }],
      }),
    });
  } catch (err) {
    console.error("[logger] Failed to send critical alert email:", err);
  }
}

export function logInfo(entry: LogEntry) {
  return writeLog("info", entry);
}

export function logWarn(entry: LogEntry) {
  return writeLog("warn", entry);
}

export function logError(entry: LogEntry) {
  return writeLog("error", entry);
}

export function logCritical(entry: LogEntry) {
  return writeLog("critical", entry);
}
