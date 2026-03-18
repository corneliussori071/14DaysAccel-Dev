"use client";

import { useState, useEffect } from "react";

const DEFAULT_MESSAGES = [
  "Analysing your business idea...",
  "Understanding your requirements...",
  "Designing your software plan...",
  "Building architecture recommendations...",
  "Almost there...",
];

export default function ThinkingIndicator({
  messages,
  className,
}: {
  messages?: string[];
  className?: string;
}) {
  const msgs = messages || DEFAULT_MESSAGES;
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (msgs.length <= 1) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % msgs.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [msgs.length]);

  return (
    <div className={`flex flex-col items-center gap-4 ${className || ""}`}>
      <div className="flex gap-1.5">
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" />
        <span className="h-2.5 w-2.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" />
      </div>
      <p className="text-sm text-zinc-500">{msgs[index]}</p>
    </div>
  );
}
