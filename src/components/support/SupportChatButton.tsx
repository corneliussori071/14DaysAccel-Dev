"use client";

import { useState } from "react";
import TicketForm from "@/components/support/TicketForm";

export default function SupportChatButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open support chat"
        className="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-zinc-900 text-white shadow-lg transition-transform hover:scale-105 hover:bg-zinc-700"
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {open && <TicketForm onClose={() => setOpen(false)} />}
    </>
  );
}
