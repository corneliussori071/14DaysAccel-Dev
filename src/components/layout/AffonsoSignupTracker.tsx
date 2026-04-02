"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

declare global {
  interface Window {
    Affonso?: {
      signup: (email: string) => void;
    };
  }
}

export default function AffonsoSignupTracker() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("new_signup") !== "true") return;

    async function trackSignup() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user?.email && window.Affonso) {
        window.Affonso.signup(user.email);
      }

      // Clean up the query param
      const url = new URL(window.location.href);
      url.searchParams.delete("new_signup");
      window.history.replaceState({}, "", url.toString());
    }

    trackSignup();
  }, [searchParams]);

  return null;
}
