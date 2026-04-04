"use client";

import { useState, useEffect, useRef } from "react";
import type { Project } from "@/types/project";
import type { AdConfig, ProductType } from "@/types/adConfig";

interface SubscriptionPlan {
  name: string;
  price_usd: number;
  tokens_per_month: number;
  is_active: boolean;
  plan_type: string;
}

type TargetUrlType = "homepage" | "product-page";

interface AdSettingsPanelProps {
  referralLink: string;
  projects: Project[];
  subscriptions: SubscriptionPlan[];
  onConfigChange: (config: AdConfig) => void;
}

const PRODUCT_TYPES: { id: ProductType; label: string }[] = [
  { id: "project", label: "Custom Project" },
  { id: "designer", label: "Software Designer" },
  { id: "subscription", label: "Subscription Plan" },
];

const TARGET_URL_OPTIONS: { id: TargetUrlType; label: string; hint: string }[] = [
  { id: "product-page", label: "Product Page", hint: "Links to the specific product or service page" },
  { id: "homepage", label: "Homepage", hint: "Links to the 14DaysAccel Dev homepage" },
];

function buildTargetUrl(
  referralLink: string,
  targetUrlType: TargetUrlType,
  productType: ProductType,
  projectSlug?: string
): string {
  try {
    const url = new URL(referralLink);
    const referralId = url.searchParams.get("atp") || "";
    if (!referralId) return referralLink;

    const origin = url.origin;

    if (targetUrlType === "homepage") {
      return `${origin}/?atp=${referralId}`;
    }

    switch (productType) {
      case "designer":
        return `${origin}/software-designer?atp=${referralId}`;
      case "subscription":
        return `${origin}/subscriptions?atp=${referralId}`;
      case "project":
        return projectSlug
          ? `${origin}/projects/${projectSlug}?atp=${referralId}`
          : `${origin}/?atp=${referralId}`;
      default:
        return `${origin}/?atp=${referralId}`;
    }
  } catch {
    return referralLink;
  }
}

function buildConfig(
  referralLink: string,
  productType: ProductType,
  targetUrlType: TargetUrlType,
  projects: Project[],
  subscriptions: SubscriptionPlan[],
  selectedProjectIdx: number,
  selectedSubIdx: number
): AdConfig {
  const project = projects[selectedProjectIdx];
  const targetUrl = buildTargetUrl(
    referralLink,
    targetUrlType,
    productType,
    project?.slug
  );

  if (productType === "designer") {
    return {
      referralLink: targetUrl,
      price: "Free",
      numericPrice: 0,
      productName: "AI Software Planner",
      productType: "designer",
      ctaText: "Try the Planner",
      tagline: "AI-powered software architecture in minutes",
    };
  }

  if (productType === "subscription") {
    const plan = subscriptions[selectedSubIdx];
    if (plan) {
      return {
        referralLink: targetUrl,
        price: `$${plan.price_usd}/mo`,
        numericPrice: plan.price_usd,
        productName: plan.name,
        productType: "subscription",
        ctaText: "Subscribe Now",
        tagline: `${plan.tokens_per_month.toLocaleString()} AI tokens per month`,
      };
    }
    return {
      referralLink: targetUrl,
      price: "$19/mo",
      numericPrice: 19,
      productName: "Starter Plan",
      productType: "subscription",
      ctaText: "Subscribe Now",
      tagline: "AI-powered software planning tools",
    };
  }

  if (project) {
    const price = project.price_usd ?? 200;
    return {
      referralLink: targetUrl,
      price: `$${price}`,
      numericPrice: price,
      productName: project.title,
      productType: "project",
      ctaText: "Start Your Project",
      tagline: `Production-ready ${project.title.toLowerCase()} in 14 days`,
    };
  }
  return {
    referralLink: targetUrl,
    price: "$200",
    numericPrice: 200,
    productName: "Custom Software Project",
    productType: "project",
    ctaText: "Start Your Project",
    tagline: "Production-ready software in 14 days",
  };
}

export default function AdSettingsPanel({
  referralLink,
  projects,
  subscriptions,
  onConfigChange,
}: AdSettingsPanelProps) {
  const [productType, setProductType] = useState<ProductType>("project");
  const [targetUrlType, setTargetUrlType] = useState<TargetUrlType>("product-page");
  const [selectedProjectIdx, setSelectedProjectIdx] = useState(0);
  const [selectedSubIdx, setSelectedSubIdx] = useState(0);
  const initialEmitted = useRef(false);

  const availableProjects = projects.filter((p) => p.status === "available");
  const activeSubs = subscriptions.filter(
    (s) => s.is_active && s.plan_type !== "custom"
  );

  // Emit default config on mount only
  useEffect(() => {
    if (initialEmitted.current) return;
    initialEmitted.current = true;
    const config = buildConfig(
      referralLink,
      productType,
      targetUrlType,
      availableProjects,
      activeSubs,
      selectedProjectIdx,
      selectedSubIdx
    );
    onConfigChange(config);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [referralLink]);

  function handleApply() {
    const config = buildConfig(
      referralLink,
      productType,
      targetUrlType,
      availableProjects,
      activeSubs,
      selectedProjectIdx,
      selectedSubIdx
    );
    onConfigChange(config);
  }

  const selectedProject = availableProjects[selectedProjectIdx];
  const previewUrl = buildTargetUrl(
    referralLink,
    targetUrlType,
    productType,
    selectedProject?.slug
  );

  return (
    <div className="mb-6 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-400">
        Ad Settings
      </div>

      {/* Product type selector */}
      <div className="flex flex-wrap gap-2 mb-3">
        {PRODUCT_TYPES.map((pt) => (
          <button
            key={pt.id}
            onClick={() => setProductType(pt.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              productType === pt.id
                ? "bg-zinc-900 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {pt.label}
          </button>
        ))}
      </div>

      {/* Project selector */}
      {productType === "project" && availableProjects.length > 0 && (
        <div className="mt-2">
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Select project
          </label>
          <select
            value={selectedProjectIdx}
            onChange={(e) => setSelectedProjectIdx(Number(e.target.value))}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-zinc-500 focus:outline-none"
          >
            {availableProjects.map((p, i) => (
              <option key={p.id} value={i}>
                {p.title}
                {p.price_usd ? ` - $${p.price_usd}` : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Subscription selector */}
      {productType === "subscription" && activeSubs.length > 0 && (
        <div className="mt-2">
          <label className="block text-xs font-medium text-zinc-500 mb-1">
            Select plan
          </label>
          <select
            value={selectedSubIdx}
            onChange={(e) => setSelectedSubIdx(Number(e.target.value))}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-800 focus:border-zinc-500 focus:outline-none"
          >
            {activeSubs.map((s, i) => (
              <option key={s.name} value={i}>
                {s.name} - ${s.price_usd}/mo
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Software Designer info */}
      {productType === "designer" && (
        <p className="mt-2 text-xs text-zinc-500">
          Ads will promote the free AI Software Planner tool.
        </p>
      )}

      {/* Target URL selector */}
      <div className="mt-4">
        <label className="block text-xs font-medium text-zinc-500 mb-1">
          Target URL
        </label>
        <div className="flex flex-wrap gap-2">
          {TARGET_URL_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTargetUrlType(opt.id)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                targetUrlType === opt.id
                  ? "bg-zinc-900 text-white"
                  : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className="mt-1 text-[11px] text-zinc-400">
          {TARGET_URL_OPTIONS.find((o) => o.id === targetUrlType)?.hint}
        </p>
        <div className="mt-1.5 rounded bg-zinc-50 border border-zinc-100 px-2.5 py-1.5">
          <code className="text-[11px] text-zinc-500 break-all">{previewUrl}</code>
        </div>
      </div>

      {/* Apply button */}
      <div className="mt-4 flex items-center justify-end">
        <button
          onClick={handleApply}
          className="rounded-md bg-zinc-900 px-5 py-2 text-xs font-semibold text-white transition-colors hover:bg-zinc-700"
        >
          Apply
        </button>
      </div>
    </div>
  );
}

export type { SubscriptionPlan };
