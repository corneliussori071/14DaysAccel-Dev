"use client";

import { useState } from "react";
import { sanitizeText, sanitizeEmail, sanitizeName } from "@/lib/sanitize";

const CATEGORIES = [
  { value: "subscriptions", label: "Subscriptions" },
  { value: "purchases", label: "Purchases" },
  { value: "enquiry", label: "Enquiry" },
  { value: "partner_affiliate", label: "Partner / Affiliate Program" },
  { value: "others", label: "Others" },
];

interface TicketFormProps {
  onClose: () => void;
}

export default function TicketForm({ onClose }: TicketFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ticketId, setTicketId] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const cleanName = sanitizeName(name);
    if (!cleanName) {
      setError("Please enter a valid name.");
      return;
    }

    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!category) {
      setError("Please select a category.");
      return;
    }

    const cleanDescription = sanitizeText(description);
    if (!cleanDescription || cleanDescription.length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cleanName,
          email: cleanEmail,
          category,
          description: cleanDescription,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to create ticket.");
        return;
      }

      setTicketId(data.ticketId);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-end p-4 sm:items-center sm:justify-end sm:p-6">
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-lg border border-zinc-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900">
            {ticketId ? "Ticket Created" : "Contact Support"}
          </h2>
          <button
            onClick={onClose}
            className="text-zinc-400 transition-colors hover:text-zinc-600"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {ticketId ? (
          <div className="p-5">
            <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-medium text-green-800">
                Your ticket has been submitted successfully.
              </p>
            </div>
            <div className="mb-4">
              <p className="mb-1 text-xs text-zinc-500">Ticket ID</p>
              <p className="rounded-md bg-zinc-100 px-3 py-2 font-mono text-sm font-semibold text-zinc-900">
                {ticketId}
              </p>
            </div>
            <p className="mb-4 text-sm text-zinc-600">
              A confirmation email has been sent. Please reference this ticket ID in any future communication.
            </p>
            <button
              onClick={onClose}
              className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5">
            {error && (
              <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="ticket-name" className="mb-1.5 block text-sm font-medium text-zinc-700">
                Name
              </label>
              <input
                id="ticket-name"
                type="text"
                required
                maxLength={200}
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                placeholder="Your name"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="ticket-email" className="mb-1.5 block text-sm font-medium text-zinc-700">
                Email
              </label>
              <input
                id="ticket-email"
                type="email"
                required
                maxLength={320}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                placeholder="you@example.com"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="ticket-category" className="mb-1.5 block text-sm font-medium text-zinc-700">
                Category
              </label>
              <select
                id="ticket-category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
              >
                <option value="">Select category</option>
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label htmlFor="ticket-description" className="mb-1.5 block text-sm font-medium text-zinc-700">
                Description
              </label>
              <textarea
                id="ticket-description"
                required
                maxLength={500}
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full resize-none rounded-md border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                placeholder="Describe your issue (10-500 characters)"
              />
              <p className="mt-1 text-right text-xs text-zinc-400">
                {description.length}/500
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Ticket"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
