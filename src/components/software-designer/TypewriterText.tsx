"use client";

import { useState, useEffect } from "react";

interface TypewriterTextProps {
  text: string;
  charsPerTick?: number;
  intervalMs?: number;
}

export default function TypewriterText({
  text,
  charsPerTick = 12,
  intervalMs = 20,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!text) {
      setDisplayed("");
      setIsComplete(false);
      return;
    }

    let i = 0;
    setDisplayed("");
    setIsComplete(false);

    const timer = setInterval(() => {
      i += charsPerTick;
      if (i >= text.length) {
        setDisplayed(text);
        setIsComplete(true);
        clearInterval(timer);
      } else {
        setDisplayed(text.slice(0, i));
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [text, charsPerTick, intervalMs]);

  return (
    <>
      {displayed}
      {!isComplete && text && (
        <span className="inline-block w-1.5 h-4 ml-0.5 bg-zinc-500 animate-pulse align-middle" />
      )}
    </>
  );
}
