"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabase";

const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour

const ACTIVITY_EVENTS: (keyof WindowEventMap)[] = [
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "pointermove",
];

export function useInactivityLogout() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listenersAttached = useRef(false);

  useEffect(() => {
    let mounted = true;

    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        if (!mounted) return;
        await supabase.auth.signOut();
        window.location.href = "/?session_expired=1";
      }, INACTIVITY_TIMEOUT_MS);
    }

    function attachListeners() {
      if (listenersAttached.current) return;
      for (const event of ACTIVITY_EVENTS) {
        window.addEventListener(event, resetTimer, { passive: true });
      }
      listenersAttached.current = true;
    }

    function detachListeners() {
      if (!listenersAttached.current) return;
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
      listenersAttached.current = false;
    }

    function startTracking() {
      attachListeners();
      resetTimer();
    }

    function stopTracking() {
      detachListeners();
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    }

    // Use onAuthStateChange as sole source of truth.
    // INITIAL_SESSION fires immediately on subscribe in supabase-js v2.39+,
    // so this handles both the initial session check and subsequent changes.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        if (session) {
          startTracking();
        } else {
          stopTracking();
        }
      }
    );

    return () => {
      mounted = false;
      stopTracking();
      subscription.unsubscribe();
    };
  }, []);
}
