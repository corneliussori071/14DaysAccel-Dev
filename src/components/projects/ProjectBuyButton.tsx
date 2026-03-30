"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import PaymentDisabledModal from "./PaymentDisabledModal";

interface ProjectBuyButtonProps {
  projectId: string;
  priceUsd: number;
  variant?: "light" | "dark";
  size?: "sm" | "md";
}

export default function ProjectBuyButton({
  projectId,
  priceUsd,
  variant = "light",
  size = "sm",
}: ProjectBuyButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [disabledInfo, setDisabledInfo] = useState<{
    message: string;
    redirect?: string | null;
  } | null>(null);

  async function handleBuy(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    // Check if payments are disabled
    try {
      const statusRes = await fetch("/api/internal/payment-status", {
        cache: "no-store",
      });
      if (statusRes.ok) {
        const status = await statusRes.json();
        if (status.disabled) {
          setDisabledInfo({
            message: status.message,
            redirect: status.redirect,
          });
          return;
        }
      }
    } catch {
      // Continue to checkout if status check fails
    }

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "/software-designer?auth=login";
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/internal/projects/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ projectId }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl;
        }
      } else {
        const err = await res.json().catch(() => null);
        if (err?.error === "already_purchased") {
          window.location.href = "/purchases";
        } else {
          setError(err?.error || "Checkout failed. Please try again.");
        }
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isDark = variant === "dark";
  const isMd = size === "md";

  const btnClass = isDark
    ? `inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors bg-white text-zinc-900 hover:bg-zinc-100 disabled:opacity-50 ${isMd ? "px-6 py-3 text-sm" : "px-4 py-1.5 text-xs"}`
    : `inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 ${isMd ? "px-6 py-3 text-sm" : "px-4 py-1.5 text-xs"}`;

  return (
    <>
      <button onClick={handleBuy} disabled={loading} className={btnClass}>
        <svg
          width={isMd ? "16" : "14"}
          height={isMd ? "16" : "14"}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
        </svg>
        {loading ? "Processing..." : `Buy $${priceUsd.toFixed(2)}`}
      </button>

      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}

      {disabledInfo && (
        <PaymentDisabledModal
          message={disabledInfo.message}
          redirect={disabledInfo.redirect}
          onClose={() => setDisabledInfo(null)}
        />
      )}
    </>
  );
}
