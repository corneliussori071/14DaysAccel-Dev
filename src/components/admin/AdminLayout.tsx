"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProjectsSection from "@/components/admin/sections/ProjectsSection";
import UsersSection from "@/components/admin/sections/UsersSection";
import TokenPricingSection from "@/components/admin/sections/TokenPricingSection";
import SubscriptionFlowSection from "@/components/admin/sections/SubscriptionFlowSection";
import FreeBenefitsSection from "@/components/admin/sections/FreeBenefitsSection";
import CommunicationSection from "@/components/admin/sections/CommunicationSection";
import EmergencyControlSection from "@/components/admin/sections/EmergencyControlSection";
import SystemMonitorSection from "@/components/admin/sections/SystemMonitorSection";
import PaymentProviderSection from "@/components/admin/sections/PaymentProviderSection";
import TicketsSection from "@/components/admin/sections/TicketsSection";

type AdminSection =
  | "projects"
  | "users"
  | "token-pricing"
  | "subscription-flow"
  | "free-benefits"
  | "communication"
  | "emergency-control"
  | "system-monitor"
  | "payment-providers"
  | "tickets";

const NAV_ITEMS: { id: AdminSection; label: string }[] = [
  { id: "projects", label: "Projects" },
  { id: "users", label: "Users" },
  { id: "token-pricing", label: "Token Pricing" },
  { id: "subscription-flow", label: "Subscription Flow" },
  { id: "free-benefits", label: "Free Benefits Duration" },
  { id: "communication", label: "Communication" },
  { id: "payment-providers", label: "Payment Providers" },
  { id: "tickets", label: "Tickets" },
  { id: "emergency-control", label: "Emergency Control" },
  { id: "system-monitor", label: "System Monitor" },
];

export default function AdminLayout() {
  const router = useRouter();
  const [activeSection, setActiveSection] =
    useState<AdminSection>("projects");

  async function handleLogout() {
    await fetch("/api/internal/auth/logout", { method: "POST" });
    router.push("/sys/gate");
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-64 shrink-0 flex-col border-r border-zinc-200 bg-white">
        <div className="border-b border-zinc-200 px-5 py-4">
          <h2 className="text-base font-semibold text-zinc-900">
            Admin Panel
          </h2>
          <p className="mt-0.5 text-xs text-zinc-400">14DaysAccel Dev</p>
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-3">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
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
            onClick={handleLogout}
            className="flex w-full items-center rounded-md px-3 py-2 text-sm text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 bg-zinc-50">
        {activeSection === "projects" && <ProjectsSection />}
        {activeSection === "users" && <UsersSection />}
        {activeSection === "token-pricing" && <TokenPricingSection />}
        {activeSection === "subscription-flow" && <SubscriptionFlowSection />}
        {activeSection === "free-benefits" && <FreeBenefitsSection />}
        {activeSection === "communication" && <CommunicationSection />}
        {activeSection === "emergency-control" && <EmergencyControlSection />}
        {activeSection === "system-monitor" && <SystemMonitorSection />}
        {activeSection === "payment-providers" && <PaymentProviderSection />}
        {activeSection === "tickets" && <TicketsSection />}
      </main>
    </div>
  );
}
