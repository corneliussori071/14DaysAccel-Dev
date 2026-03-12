import { cookies } from "next/headers";

interface AdminSession {
  role: string;
  iat: number;
  exp: number;
}

export async function verifyAdminSession(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("admin_session")?.value;

    if (!token) return false;

    const decoded = JSON.parse(
      Buffer.from(token, "base64").toString("utf-8")
    ) as AdminSession;

    if (decoded.role !== "admin") return false;
    if (Date.now() > decoded.exp) return false;

    return true;
  } catch {
    return false;
  }
}
