"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fetchReferralLink } from "@/services/referralLinkService";
import { getAllProjects } from "@/services/projectService";
import type { Project } from "@/types/project";
import type { SubscriptionPlan } from "@/components/marketing-toolkit/AdSettingsPanel";
import AuthModal from "@/components/software-designer/AuthModal";
import BannerAssets from "@/components/marketing-toolkit/tabs/BannerAssets";
import WidgetAssets from "@/components/marketing-toolkit/tabs/WidgetAssets";
import PopupAssets from "@/components/marketing-toolkit/tabs/PopupAssets";
import LinkAssets from "@/components/marketing-toolkit/tabs/LinkAssets";
import ProductCardAssets from "@/components/marketing-toolkit/tabs/ProductCardAssets";
import EmailTemplateAssets from "@/components/marketing-toolkit/tabs/EmailTemplateAssets";
import LandingPageAssets from "@/components/marketing-toolkit/tabs/LandingPageAssets";
import ComparisonWidgetAssets from "@/components/marketing-toolkit/tabs/ComparisonWidgetAssets";
import TestimonialWidgetAssets from "@/components/marketing-toolkit/tabs/TestimonialWidgetAssets";
import Link from "next/link";

type AssetTab =
  | "banners"
  | "widgets"
  | "popups"
  | "links"
  | "product-cards"
  | "email-templates"
  | "landing-pages"
  | "comparison"
  | "testimonials";

const TABS: { id: AssetTab; label: string }[] = [
  { id: "banners", label: "Banners" },
  { id: "widgets", label: "Widgets" },
  { id: "popups", label: "Pop-ups" },
  { id: "links", label: "Links" },
  { id: "product-cards", label: "Product Cards" },
  { id: "email-templates", label: "Email Templates" },
  { id: "landing-pages", label: "Landing Pages" },
  { id: "comparison", label: "Comparison" },
  { id: "testimonials", label: "Testimonials" },
];

export default function MarketingToolkitLayout() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referralLink, setReferralLink] = useState<string>("");
  const [referralError, setReferralError] = useState<string>("");
  const [activeTab, setActiveTab] = useState<AssetTab>("banners");
  const [projects, setProjects] = useState<Project[]>([]);
  const [subscriptions, setSubscriptions] = useState<SubscriptionPlan[]>([]);

  useEffect(() => {
    async function checkAuth() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setAuthenticated(true);
        loadReferralLink();
        loadCatalog();
      } else {
        setShowAuth(true);
      }
      setLoading(false);
    }

    checkAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setAuthenticated(true);
        setShowAuth(false);
        loadReferralLink();
        loadCatalog();
      } else {
        setAuthenticated(false);
        setReferralLink("");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadReferralLink() {
    try {
      const data = await fetchReferralLink();
      setReferralLink(data.referralLink);
      setReferralError("");
    } catch (err) {
      setReferralError(
        err instanceof Error ? err.message : "Failed to load referral link."
      );
    }
  }

  async function loadCatalog() {
    try {
      const [allProjects, subsRes] = await Promise.all([
        getAllProjects(),
        fetch("/api/internal/subscriptions").then((r) =>
          r.ok ? r.json() : []
        ),
      ]);
      setProjects(allProjects);
      if (Array.isArray(subsRes)) setSubscriptions(subsRes);
    } catch {
      // use defaults
    }
  }

  function handleAuthClose() {
    setShowAuth(false);
    if (!authenticated) {
      router.push("/partners");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-zinc-50">
        <div className="mx-auto max-w-2xl px-6 py-24 text-center">
          <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Marketing Toolkit
          </p>
          <h1 className="mt-4 text-2xl font-semibold text-zinc-900">
            Log in to access marketing assets
          </h1>
          <p className="mt-3 text-sm text-zinc-500">
            Marketing assets contain your unique referral link. Log in or create
            an account to get personalized embed codes.
          </p>
          <button
            onClick={() => setShowAuth(true)}
            className="mt-8 inline-block rounded-md bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700"
          >
            Log In or Sign Up
          </button>
          <div className="mt-4">
            <Link
              href="/partners"
              className="text-sm text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Back to Partner Program
            </Link>
          </div>
        </div>
        {showAuth && (
          <AuthModal onClose={handleAuthClose} initialMode="login" />
        )}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-50">
      {/* Header */}
      <section className="border-b border-zinc-200 bg-white px-6 py-10 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Link
              href="/partners"
              className="transition-colors hover:text-zinc-700"
            >
              Partner Program
            </Link>
            <span>/</span>
            <span className="text-zinc-600">Marketing Toolkit</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight text-zinc-900">
            Marketing Toolkit
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Embeddable marketing assets with your referral link built in. Copy
            the code and add it to your website.
          </p>

          {referralError && (
            <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{referralError}</p>
            </div>
          )}

          {referralLink && (
            <div className="mt-4 flex items-center gap-3 rounded-md border border-zinc-200 bg-zinc-50 px-4 py-3">
              <span className="text-xs font-medium text-zinc-500">
                Your referral link:
              </span>
              <code className="flex-1 truncate text-xs text-zinc-700">
                {referralLink}
              </code>
            </div>
          )}
        </div>
      </section>

      {/* Tabs */}
      <section className="border-b border-zinc-200 bg-white px-6 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex gap-1 overflow-x-auto py-1 scrollbar-hide">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap rounded-md px-4 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Tab Content */}
      <section className="px-6 py-10 md:px-12">
        <div className="mx-auto max-w-6xl">
          {!referralLink && !referralError && (
            <div className="flex items-center justify-center py-20">
              <p className="text-sm text-zinc-500">
                Loading your referral link...
              </p>
            </div>
          )}

          {referralLink && (
            <>
              {activeTab === "banners" && (
                <BannerAssets referralLink={referralLink} projects={projects} subscriptions={subscriptions} />
              )}
              {activeTab === "widgets" && (
                <WidgetAssets referralLink={referralLink} projects={projects} subscriptions={subscriptions} />
              )}
              {activeTab === "popups" && (
                <PopupAssets referralLink={referralLink} projects={projects} subscriptions={subscriptions} />
              )}
              {activeTab === "links" && (
                <LinkAssets referralLink={referralLink} projects={projects} subscriptions={subscriptions} />
              )}
              {activeTab === "product-cards" && (
                <ProductCardAssets referralLink={referralLink} projects={projects} subscriptions={subscriptions} />
              )}
              {activeTab === "email-templates" && (
                <EmailTemplateAssets referralLink={referralLink} projects={projects} subscriptions={subscriptions} />
              )}
              {activeTab === "landing-pages" && (
                <LandingPageAssets referralLink={referralLink} projects={projects} subscriptions={subscriptions} />
              )}
              {activeTab === "comparison" && (
                <ComparisonWidgetAssets referralLink={referralLink} projects={projects} subscriptions={subscriptions} />
              )}
              {activeTab === "testimonials" && (
                <TestimonialWidgetAssets referralLink={referralLink} projects={projects} subscriptions={subscriptions} />
              )}
            </>
          )}
        </div>
      </section>

      {showAuth && (
        <AuthModal onClose={handleAuthClose} initialMode="login" />
      )}
    </main>
  );
}
