"use client";

import { useState } from "react";

interface AssetInstructionsProps {
  steps: string[];
  complianceNotes?: string[];
}

export default function AssetInstructions({
  steps,
  complianceNotes,
}: AssetInstructionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-3 rounded-md border border-zinc-200 bg-zinc-50">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-xs font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
      >
        <span>How to use this asset</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div className="border-t border-zinc-200 px-4 py-3 space-y-3">
          <ol className="list-decimal list-inside space-y-2">
            {steps.map((step, i) => (
              <li key={i} className="text-xs leading-relaxed text-zinc-600">
                {step}
              </li>
            ))}
          </ol>

          {complianceNotes && complianceNotes.length > 0 && (
            <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 mb-1">
                Compliance Notes
              </p>
              <ul className="list-disc list-inside space-y-1">
                {complianceNotes.map((note, i) => (
                  <li key={i} className="text-xs text-amber-800">
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
