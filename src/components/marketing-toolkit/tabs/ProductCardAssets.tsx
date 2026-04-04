"use client";

import { useState } from "react";
import AssetPreview from "@/components/marketing-toolkit/AssetPreview";
import AssetInstructions from "@/components/marketing-toolkit/AssetInstructions";
import AdSettingsPanel from "@/components/marketing-toolkit/AdSettingsPanel";
import type { SubscriptionPlan } from "@/components/marketing-toolkit/AdSettingsPanel";
import type { Project } from "@/types/project";
import type { AdConfig } from "@/types/adConfig";

interface ProductCardAssetsProps {
  referralLink: string;
  projects: Project[];
  subscriptions: SubscriptionPlan[];
}

function productCard(c: AdConfig): string {
  const typeLabel =
    c.productType === "designer"
      ? "AI Planner"
      : c.productType === "subscription"
        ? "Subscription Plan"
        : "Software Project";
  const gradient =
    c.productType === "designer"
      ? "linear-gradient(135deg,#1e1b4b,#312e81)"
      : c.productType === "subscription"
        ? "linear-gradient(135deg,#0f172a,#1e3a5f)"
        : "linear-gradient(135deg,#18181b,#292524)";
  const accent =
    c.productType === "designer" ? "#a78bfa" : c.productType === "subscription" ? "#38bdf8" : "#f59e0b";
  const priceDisplay = c.productType === "subscription"
    ? `<span style="font-size:28px;font-weight:800;color:#18181b">${c.price}</span><span style="font-size:12px;color:#71717a">/month</span>`
    : `<span style="font-size:28px;font-weight:800;color:#18181b">${c.price}</span>`;

  return `<!-- 14DaysAccel Dev - Product Card: ${c.productName} - Sponsored -->
<div style="width:300px;max-width:calc(100vw - 40px);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);transition:transform 0.2s,box-shadow 0.2s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)'">
  <div style="position:relative;background:${gradient};padding:20px;text-align:center">
    <div style="position:absolute;top:8px;right:8px;background:rgba(251,191,36,0.9);color:#78350f;font-size:8px;font-weight:700;padding:2px 5px;border-radius:3px;letter-spacing:0.5px;text-transform:uppercase">Sponsored</div>
    <div style="color:${accent};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px">${typeLabel}</div>
    <div style="color:#fff;font-size:18px;font-weight:700;margin-top:8px;line-height:1.3">${c.productName}</div>
  </div>
  <div style="background:#fff;padding:20px">
    <p style="font-size:12px;color:#52525b;line-height:1.6;margin:0 0 16px">${c.tagline}.</p>
    <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:16px">
      ${priceDisplay}
    </div>
    <a href="${c.referralLink}" target="_blank" rel="noopener noreferrer sponsored" style="display:block;text-align:center;background:#18181b;color:#fff;padding:10px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;transition:background 0.2s" onmouseover="this.style.background='#3f3f46'" onmouseout="this.style.background='#18181b'">${c.ctaText}</a>
  </div>
</div>`;
}

const instructions = [
  "Use the Ad Settings panel above to choose a product type, select a specific project or plan, and set the target URL. Click 'Apply' to update all product cards with your settings.",
  "Click 'Copy Code' to copy the product card HTML to your clipboard.",
  "Paste the card into your website where you want to showcase a specific product or plan.",
  "Cards are 300px wide and adapt well to grid layouts. Place multiple cards side-by-side for comparison.",
  "Each card includes hover animations (lift and shadow effect) for engagement.",
  "Your referral link is embedded in the call-to-action button.",
  "Cards are self-contained with inline styles. No CSS or JS dependencies required.",
];

const complianceNotes = [
  "Each card includes a 'Sponsored' disclosure label.",
  "Ensure product pricing and descriptions accurately reflect the current offerings.",
  "Do not modify pricing or feature claims in the embedded code.",
];

export default function ProductCardAssets({ referralLink, projects, subscriptions }: ProductCardAssetsProps) {
  const [config, setConfig] = useState<AdConfig>({
    referralLink,
    price: "$200",
    numericPrice: 200,
    productName: "Custom Software Project",
    productType: "project",
    ctaText: "View Project",
    tagline: "Production-ready software in 14 days",
  });

  const code = productCard(config);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Product Cards</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Showcase the selected project or plan. Use the Ad Settings to switch between products.
        </p>
      </div>

      <AdSettingsPanel
        referralLink={referralLink}
        projects={projects}
        subscriptions={subscriptions}
        onConfigChange={setConfig}
      />

      <AssetPreview
        title={`${config.productName} Card`}
        description={`Product card for ${config.productName}. ${config.productType === "project" ? "Software project" : config.productType === "designer" ? "AI planner" : "Subscription plan"} listing.`}
        embedCode={code}
        previewHeight={350}
        disclosureLabel="Sponsored"
      />
      <AssetInstructions steps={instructions} complianceNotes={complianceNotes} />
    </div>
  );
}
