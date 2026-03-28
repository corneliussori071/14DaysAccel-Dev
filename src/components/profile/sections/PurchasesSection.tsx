"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { ProjectPurchase } from "@/types/project";

interface PurchaseWithProject extends ProjectPurchase {
  project_title?: string;
  project_slug?: string;
  project_image?: string;
}

export default function PurchasesSection() {
  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<PurchaseWithProject[]>([]);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.access_token) {
        fetchPurchases(session.access_token);
      } else {
        setLoading(false);
      }
    });
  }, []);

  async function fetchPurchases(token: string) {
    try {
      const res = await fetch("/api/internal/projects/download?list=true", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPurchases(data.purchases ?? []);
      }
    } catch {
      // Fail silently
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(purchaseId: string) {
    setDownloadingId(purchaseId);
    try {
      const session = (await supabase.auth.getSession()).data.session;
      if (!session) return;

      const res = await fetch(
        `/api/internal/projects/download?purchaseId=${encodeURIComponent(purchaseId)}`,
        { headers: { Authorization: `Bearer ${session.access_token}` } }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.sourceCodeUrl) {
          window.open(data.sourceCodeUrl, "_blank");
        }
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.error || "Download failed. Please try again.");
      }
    } catch {
      alert("Download failed. Please try again.");
    } finally {
      setDownloadingId(null);
    }
  }

  function isExpired(expiresAt: string) {
    return new Date(expiresAt) < new Date();
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function daysRemaining(expiresAt: string) {
    const diff = new Date(expiresAt).getTime() - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return Math.max(0, days);
  }

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-sm text-zinc-400">Loading purchases...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
        My Purchases
      </h1>
      <p className="mt-2 text-sm text-zinc-500">
        Download your purchased project source code and supplementary files.
        Downloads are available for 30 days from the purchase date.
      </p>

      {purchases.length === 0 ? (
        <div className="mt-12 rounded-lg border border-zinc-200 bg-zinc-50 p-12 text-center">
          <p className="text-sm text-zinc-500">
            You have not purchased any projects yet.
          </p>
          <Link
            href="/projects"
            className="mt-4 inline-block rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Browse Projects
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {purchases.map((purchase) => {
            const expired = isExpired(purchase.download_expires_at);
            const days = daysRemaining(purchase.download_expires_at);

            return (
              <div
                key={purchase.id}
                className="rounded-lg border border-zinc-200 bg-white p-6"
              >
                <div className="flex items-start gap-4">
                  {purchase.project_image && (
                    <div className="hidden h-16 w-24 shrink-0 overflow-hidden rounded-md bg-zinc-100 sm:block">
                      <img
                        src={purchase.project_image}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-base font-semibold text-zinc-900">
                          {purchase.project_title || "Project"}
                        </h3>
                        <p className="mt-1 text-xs text-zinc-400">
                          Purchased {formatDate(purchase.created_at)} &middot;
                          ${(purchase.amount_cents / 100).toFixed(2)} {purchase.currency}
                        </p>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          purchase.status === "completed" && !expired
                            ? "bg-green-50 text-green-700"
                            : expired
                              ? "bg-zinc-100 text-zinc-500"
                              : "bg-yellow-50 text-yellow-700"
                        }`}
                      >
                        {expired
                          ? "Expired"
                          : purchase.status === "completed"
                            ? `${days} days left`
                            : purchase.status}
                      </span>
                    </div>

                    {purchase.status === "completed" && !expired && (
                      <div className="mt-4 flex items-center gap-3">
                        <button
                          onClick={() => handleDownload(purchase.id)}
                          disabled={downloadingId === purchase.id}
                          className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
                        >
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                          </svg>
                          {downloadingId === purchase.id
                            ? "Generating link..."
                            : "Download Source Code"}
                        </button>
                        {purchase.project_slug && (
                          <Link
                            href={`/projects/${purchase.project_slug}`}
                            className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                          >
                            View project
                          </Link>
                        )}
                      </div>
                    )}

                    {expired && (
                      <p className="mt-3 text-xs text-zinc-400">
                        Your download access has expired. Contact support if you
                        need assistance.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
