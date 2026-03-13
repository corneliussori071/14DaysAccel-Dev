"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import AuthModal from "@/components/software-designer/AuthModal";

interface NavItem {
  label: string;
  href: string;
}

const navItems: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "Software Designer", href: "/software-designer" },
  { label: "Engineering", href: "/#engineering" },
  { label: "Contact", href: "/#contact" },
];

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  function openLogin() {
    setAuthMode("login");
    setShowAuth(true);
  }

  function openSignup() {
    setAuthMode("signup");
    setShowAuth(true);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 md:px-12 lg:px-24">
          <Link
            href="/"
            className="flex items-center gap-2 text-base font-semibold tracking-tight text-zinc-900"
          >
            <Image
              src="/logo.jpg"
              alt="14DaysAccel Dev logo"
              width={32}
              height={32}
              className="rounded"
            />
            14DaysAccel Dev
          </Link>
          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="hidden text-sm text-zinc-500 md:inline">
                  {user.email}
                </span>
                <button
                  onClick={handleLogout}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={openLogin}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                >
                  Log In
                </button>
                <button
                  onClick={openSignup}
                  className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {showAuth && (
        <AuthModal
          onClose={() => setShowAuth(false)}
          initialMode={authMode}
        />
      )}
    </>
  );
}
