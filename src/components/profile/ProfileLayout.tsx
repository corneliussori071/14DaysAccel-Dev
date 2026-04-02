"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import PersonalInfoSection from "@/components/profile/sections/PersonalInfoSection";
import SoftwarePlannerSection from "@/components/profile/sections/SoftwarePlannerSection";
import BillingSection from "@/components/profile/sections/BillingSection";
import PlansSection from "@/components/profile/sections/PlansSection";
import PurchasesSection from "@/components/profile/sections/PurchasesSection";

type ProfileSection =
  | "personal-info"
  | "software-planner"
  | "billing"
  | "plans"
  | "purchases";

const NAV_ITEMS: { id: ProfileSection; label: string }[] = [
  { id: "personal-info", label: "Personal Information" },
  { id: "software-planner", label: "Software Planner" },
  { id: "billing", label: "Billing" },
  { id: "plans", label: "Plans" },
  { id: "purchases", label: "My Purchases" },
];

export default function ProfileLayout() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] =
    useState<ProfileSection>("personal-info");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) {
        router.push("/");
        return;
      }
      setUser(session.user);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.push("/");
        return;
      }
      setUser(session.user);
    });

    return () => subscription.unsubscribe();
  }, [router]);

  function handleNavClick(id: ProfileSection) {
    setActiveSection(id);
    setSidebarOpen(false);
  }

  const activeLabel = NAV_ITEMS.find((n) => n.id === activeSection)?.label ?? "";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Mobile breadcrumb bar */}
      <div className="flex items-center gap-2 border-b border-zinc-200 bg-white px-4 py-3 md:hidden">
        <button
          onClick={() => setSidebarOpen((prev) => !prev)}
          aria-label="Toggle navigation"
          className="flex h-8 w-8 items-center justify-center rounded-md text-zinc-600 hover:bg-zinc-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <span className="text-xs text-zinc-400">My Account</span>
        <span className="text-xs text-zinc-400">/</span>
        <span className="text-sm font-medium text-zinc-900">{activeLabel}</span>
      </div>

      {/* Sidebar overlay on mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-40 flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white transition-transform duration-200 md:static md:translate-x-0`}
      >
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900">
            My Account
          </h2>
          <p className="mt-0.5 truncate text-xs text-zinc-400">
            {user?.email}
          </p>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`flex w-full items-center rounded-md px-3 py-2 text-sm transition-colors ${
                activeSection === item.id
                  ? "bg-zinc-900 font-medium text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="border-t border-zinc-200 px-3 py-3">
          <button
            onClick={() => router.push("/")}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            Back to Home
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-zinc-50">
        {activeSection === "personal-info" && <PersonalInfoSection />}
        {activeSection === "software-planner" && <SoftwarePlannerSection />}
        {activeSection === "billing" && <BillingSection />}
        {activeSection === "plans" && <PlansSection />}
        {activeSection === "purchases" && <PurchasesSection />}
      </main>
    </div>
  );
}
