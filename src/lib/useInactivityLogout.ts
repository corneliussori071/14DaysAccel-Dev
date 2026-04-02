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

  useEffect(() => {
    let mounted = true;

    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        if (!mounted) return;
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          await supabase.auth.signOut();
          window.location.href = "/?session_expired=1";
        }
      }, INACTIVITY_TIMEOUT_MS);
    }

    // Only start tracking if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session || !mounted) return;
      resetTimer();
      for (const event of ACTIVITY_EVENTS) {
        window.addEventListener(event, resetTimer, { passive: true });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          resetTimer();
        } else if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    );

    return () => {
      mounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }
      subscription.unsubscribe();
    };
  }, []);
}
