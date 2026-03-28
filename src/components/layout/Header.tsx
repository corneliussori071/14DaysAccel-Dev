"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
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
  { label: "Pricing", href: "/subscriptions" },
  { label: "Contact", href: "/#contact" },
];

export default function Header() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdminRoute = pathname.startsWith("/sys");

  if (isAdminRoute) return null;

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

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  function openLogin() {
    setAuthMode("login");
    setShowAuth(true);
    setMobileMenuOpen(false);
  }

  function openSignup() {
    setAuthMode("signup");
    setShowAuth(true);
    setMobileMenuOpen(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setMobileMenuOpen(false);
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
          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link
                  href="/purchases"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                >
                  My Purchases
                </Link>
                <Link
                  href="/profile"
                  className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                >
                  Account
                </Link>
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
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center justify-center md:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-zinc-200 bg-white px-6 pb-4 pt-2 md:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                >
                  {item.label}
                </Link>
              ))}
              {user && (
                <>
                  <Link
                    href="/purchases"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    My Purchases
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-md px-3 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
                  >
                    Account
                  </Link>
                </>
              )}
            </nav>
            <div className="mt-3 flex flex-col gap-2 border-t border-zinc-100 pt-3">
              {user ? (
                <button
                  onClick={handleLogout}
                  className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                >
                  Log Out
                </button>
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
        )}
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
