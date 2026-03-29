"use client";

import { useEffect } from "react";

interface PaymentDisabledModalProps {
  message: string;
  redirect?: string | null;
  onClose: () => void;
}

export default function PaymentDisabledModal({
  message,
  redirect,
  onClose,
}: PaymentDisabledModalProps) {
  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-xl bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-zinc-600"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        <h3 className="text-base font-semibold text-zinc-900">
          Payments Unavailable
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          {message}
        </p>

        {redirect && (
          <a
            href={redirect}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-zinc-900 hover:underline"
          >
            Learn more
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
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
          </a>
        )}

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full rounded-md bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
