"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface TypewriterTextProps {
  text: string;
  charsPerTick?: number;
  intervalMs?: number;
  onComplete?: () => void;
}

export default function TypewriterText({
  text,
  charsPerTick = 3,
  intervalMs = 18,
  onComplete,
}: TypewriterTextProps) {
  const [displayed, setDisplayed] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const cursorRef = useRef<HTMLSpanElement>(null);

  const scrollToView = useCallback(() => {
    cursorRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, []);

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

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
        onCompleteRef.current?.();
      } else {
        setDisplayed(text.slice(0, i));
      }
      scrollToView();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [text, charsPerTick, intervalMs, scrollToView]);

  return (
    <>
      {displayed}
      {!isComplete && text && (
        <span
          ref={cursorRef}
          className="inline-block w-1.5 h-4 ml-0.5 bg-zinc-500 animate-pulse align-middle"
        />
      )}
      {isComplete && <span ref={cursorRef} />}
    </>
  );
}
