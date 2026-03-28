"use client";

import { useState } from "react";
import { sanitizeText, sanitizeEmail } from "@/lib/sanitize";

interface RegisterInterestButtonProps {
  projectId: string;
  variant?: "light" | "dark";
  size?: "sm" | "md";
}

export default function RegisterInterestButton({
  projectId,
  variant = "light",
  size = "sm",
}: RegisterInterestButtonProps) {
  const [expanded, setExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    const cleanedEmail = sanitizeEmail(email);
    if (!cleanedEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    const cleanedName = name.trim() ? sanitizeText(name) : undefined;
    if (name.trim() && !cleanedName) {
      setError("Please enter a valid name.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/internal/projects/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          email: cleanedEmail,
          name: cleanedName,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json().catch(() => null);
        setError(data?.error || "Something went wrong. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const isDark = variant === "dark";
  const isMd = size === "md";

  if (submitted) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 text-xs font-medium ${isDark ? "text-green-400" : "text-green-600"}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
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
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Interest registered
      </span>
    );
  }

  if (!expanded) {
    const btnClass = isDark
      ? `inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors border border-white/30 text-white/80 hover:bg-white/10 ${isMd ? "px-6 py-3 text-sm" : "px-4 py-1.5 text-xs"}`
      : `inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors border border-zinc-300 text-zinc-600 hover:bg-zinc-50 ${isMd ? "px-6 py-3 text-sm" : "px-4 py-1.5 text-xs"}`;

    return (
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setExpanded(true);
        }}
        className={btnClass}
      >
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
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
        Register Interest
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={`rounded-lg p-3 space-y-2 ${isDark ? "bg-white/10" : "bg-zinc-50 border border-zinc-200"}`}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email address"
        className={`w-full rounded-md px-3 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/10 border border-white/20 text-white placeholder:text-white/40" : "border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400"}`}
      />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Name (optional)"
        className={`w-full rounded-md px-3 py-1.5 text-xs focus:outline-none ${isDark ? "bg-white/10 border border-white/20 text-white placeholder:text-white/40" : "border border-zinc-200 bg-white text-zinc-900 placeholder:text-zinc-400"}`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${isDark ? "bg-white text-zinc-900 hover:bg-zinc-100" : "bg-zinc-900 text-white hover:bg-zinc-800"}`}
        >
          {loading ? "Submitting..." : "Notify Me"}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className={`text-xs transition-colors ${isDark ? "text-white/50 hover:text-white/70" : "text-zinc-400 hover:text-zinc-600"}`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
