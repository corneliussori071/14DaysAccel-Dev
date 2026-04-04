import { supabase } from "@/lib/supabase";

interface ReferralLinkResponse {
  referralLink: string;
  userId: string;
  partnerEmail: string;
}

export async function fetchReferralLink(): Promise<ReferralLinkResponse> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("You must be logged in to access marketing assets.");
  }

  const res = await fetch("/api/internal/referral-link", {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error || "Failed to load referral link.");
  }

  return res.json();
}
