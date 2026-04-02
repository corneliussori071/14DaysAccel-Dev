"use client";

import { useInactivityLogout } from "@/lib/useInactivityLogout";

export default function InactivityGuard() {
  useInactivityLogout();
  return null;
}
