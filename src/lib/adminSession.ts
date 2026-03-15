import { cookies } from "next/headers";
import crypto from "crypto";

interface AdminSession {
  role: string;
  iat: number;
  exp: number;
}

function getSigningSecret(): string {
  const secret = process.env.ADMIN_PASSPHRASE;
  if (!secret) throw new Error("Missing ADMIN_PASSPHRASE");
  return secret;
}

export function signAdminToken(): string {
  const payload: AdminSession = {
    role: "admin",
    iat: Date.now(),
    exp: Date.now() + 4 * 60 * 60 * 1000,
  };
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", getSigningSecret())
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;
    if (!token) return false;

    const [data, signature] = token.split(".");
    if (!data || !signature) return false;

    const expected = crypto
      .createHmac("sha256", getSigningSecret())
      .update(data)
      .digest("base64url");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
      return false;
    }

    const decoded = JSON.parse(
      Buffer.from(data, "base64url").toString("utf-8")
    ) as AdminSession;

    if (decoded.role !== "admin") return false;
    if (Date.now() > decoded.exp) return false;

    return true;
  } catch {
    return false;
  }
}
