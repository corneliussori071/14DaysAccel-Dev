"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function ReferralDashboardSection() {
  const [embedToken, setEmbedToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchToken() {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          setError("You must be logged in to view your referral dashboard.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/internal/embed-token", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error || "Failed to load referral dashboard.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setEmbedToken(data.token);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10 md:px-10">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-zinc-900">
          Referral Program
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Share your referral link and earn 30% commission on all purchases,
          including recurring subscriptions.
        </p>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-zinc-500">Loading dashboard...</p>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {embedToken && (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <iframe
            src={`https://affonso.io/embed/referrals?token=${embedToken}&theme=light&lang=en&showHeader=true&showRewards=true&showReports=true&showResources=true&enableQRCode=true&padding=true`}
            style={{ width: "100%", height: "700px", border: "none" }}
            allow="clipboard-write"
            title="Referral Dashboard"
          />
        </div>
      )}

      <div className="mt-6 space-y-3">
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3">
          <p className="text-xs text-zinc-500">
            Access embeddable banners, widgets, pop-ups, and more with your referral link built in.{" "}
            <a
              href="/partners/marketing-toolkit"
              className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
            >
              Open Marketing Toolkit
            </a>
          </p>
        </div>
        <div className="rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3">
          <p className="text-xs text-zinc-500">
            Want to manage your affiliate account directly?{" "}
            <a
              href="https://14daysacceldev.affonso.io/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-zinc-700 underline underline-offset-2 hover:text-zinc-900"
            >
              Open partner portal
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
