"use client";

import { useState } from "react";
import AssetPreview from "@/components/marketing-toolkit/AssetPreview";
import AssetInstructions from "@/components/marketing-toolkit/AssetInstructions";
import AdSettingsPanel from "@/components/marketing-toolkit/AdSettingsPanel";
import type { SubscriptionPlan } from "@/components/marketing-toolkit/AdSettingsPanel";
import type { Project } from "@/types/project";
import type { AdConfig } from "@/types/adConfig";

interface LinkAssetsProps {
  referralLink: string;
  projects: Project[];
  subscriptions: SubscriptionPlan[];
}

function styledTextLink(c: AdConfig): string {
  const text =
    c.productType === "designer"
      ? "14DaysAccel Dev AI Planner - Free software architecture tool"
      : c.productType === "subscription"
        ? `${c.productName} - AI-powered development tools from ${c.price}`
        : `14DaysAccel Dev - Production-ready software in 14 days from ${c.price}`;

  return `<!-- 14DaysAccel Dev - Styled Text Link - Ad -->
<span style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;font-size:inherit">
  <a href="${c.referralLink}" target="_blank" rel="noopener noreferrer sponsored" style="color:#0ea5e9;font-weight:600;text-decoration:underline;text-underline-offset:3px;transition:color 0.2s" onmouseover="this.style.color='#0369a1'" onmouseout="this.style.color='#0ea5e9'">${text}</a>
  <span style="font-size:0.75em;color:#71717a;margin-left:4px">(ad)</span>
</span>`;
}

function ctaTextLink(c: AdConfig): string {
  const headline =
    c.productType === "designer"
      ? "Plan your software with AI"
      : c.productType === "subscription"
        ? `Unlock ${c.productName}`
        : "Need software built fast?";
  const body =
    c.productType === "designer"
      ? "The free AI Software Planner generates security-first architecture for your next project."
      : c.productType === "subscription"
        ? `${c.tagline}. AI-powered development starting at ${c.price}.`
        : `14DaysAccel Dev delivers production-ready applications in under 14 days, starting at ${c.price}.`;

  return `<!-- 14DaysAccel Dev - CTA Text Link - Sponsored -->
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:14px 18px;display:inline-block;max-width:480px">
  <div style="font-size:9px;font-weight:700;color:#78350f;background:#fef3c7;display:inline-block;padding:2px 6px;border-radius:3px;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px">Sponsored</div>
  <div style="font-size:14px;font-weight:600;color:#0f172a;margin-bottom:4px">${headline}</div>
  <div style="font-size:12px;color:#64748b;margin-bottom:10px">${body}</div>
  <a href="${c.referralLink}" target="_blank" rel="noopener noreferrer sponsored" style="font-size:12px;font-weight:600;color:#0ea5e9;text-decoration:none;display:inline-flex;align-items:center;gap:4px;transition:color 0.2s" onmouseover="this.style.color='#0369a1'" onmouseout="this.style.color='#0ea5e9'">${c.ctaText} &#8594;</a>
</div>`;
}

function deepLink(c: AdConfig): string {
  const label =
    c.productType === "designer"
      ? "Try AI Planner"
      : c.productType === "subscription"
        ? `Get ${c.productName}`
        : "Try 14DaysAccel Dev";

  return `<!-- 14DaysAccel Dev - Deep Link - Ad -->
<a href="${c.referralLink}" target="_blank" rel="noopener noreferrer sponsored" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:inline-flex;align-items:center;gap:8px;background:#18181b;color:#fff;padding:10px 20px;border-radius:8px;font-size:13px;font-weight:600;text-decoration:none;transition:background 0.2s;box-shadow:0 2px 8px rgba(0,0,0,0.12)" onmouseover="this.style.background='#3f3f46'" onmouseout="this.style.background='#18181b'">
  <span style="font-size:9px;background:rgba(251,191,36,0.9);color:#78350f;padding:2px 5px;border-radius:3px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px">Ad</span>
  ${label} &#8594;
</a>`;
}

function inlineRecommendation(c: AdConfig): string {
  const text =
    c.productType === "designer"
      ? `I use <a href="${c.referralLink}" target="_blank" rel="noopener noreferrer sponsored" style="color:#0ea5e9;font-weight:600;text-decoration:underline;text-underline-offset:2px">14DaysAccel Dev's AI Planner</a> to architect software projects. Free, security-first, and fast.`
      : c.productType === "subscription"
        ? `I use <a href="${c.referralLink}" target="_blank" rel="noopener noreferrer sponsored" style="color:#0ea5e9;font-weight:600;text-decoration:underline;text-underline-offset:2px">${c.productName}</a> for AI-powered development. ${c.tagline} for ${c.price}.`
        : `I use <a href="${c.referralLink}" target="_blank" rel="noopener noreferrer sponsored" style="color:#0ea5e9;font-weight:600;text-decoration:underline;text-underline-offset:2px">14DaysAccel Dev</a> for rapid software delivery. Production-ready apps in 14 days, starting at ${c.price}.`;

  return `<!-- 14DaysAccel Dev - Inline Recommendation - Sponsored -->
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border-left:3px solid #0ea5e9;padding:12px 16px;background:#f0f9ff;border-radius:0 6px 6px 0;max-width:520px">
  <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
    <span style="font-size:9px;font-weight:700;color:#78350f;background:#fef3c7;padding:2px 5px;border-radius:3px;text-transform:uppercase;letter-spacing:0.5px">Sponsored</span>
    <span style="font-size:11px;font-weight:600;color:#0c4a6e">Recommendation</span>
  </div>
  <div style="font-size:13px;color:#0f172a;line-height:1.5">${text}</div>
</div>`;
}

const instructions = [
  "Use the Ad Settings panel above to choose a product type, select a specific project or plan, and set the target URL. Click 'Apply' to update all links with your settings.",
  "Click 'Copy Code' to copy the link HTML to your clipboard.",
  "Styled text links can be placed inline within blog posts, articles, or any text content.",
  "CTA text links and inline recommendations work well at the end of articles or in sidebar sections.",
  "Deep links function as button-style clickable elements. Place them in navigation areas or call-to-action sections.",
  "All links include rel='sponsored' for proper search engine disclosure.",
  "Your referral link is embedded in every clickable element.",
];

const complianceNotes = [
  "All links include 'ad' or 'sponsored' disclosure visible to readers.",
  "Links use rel='noopener noreferrer sponsored' to comply with Google's link attribute requirements.",
  "Do not use deceptive anchor text that misrepresents the destination.",
];

export default function LinkAssets({ referralLink, projects, subscriptions }: LinkAssetsProps) {
  const [config, setConfig] = useState<AdConfig>({
    referralLink,
    price: "$200",
    numericPrice: 200,
    productName: "Custom Software Project",
    productType: "project",
    ctaText: "Learn more",
    tagline: "Production-ready software in 14 days",
  });

  const links = [
    {
      title: "Styled Text Link",
      description: "Inline text link with hover effect. Place within paragraphs and articles.",
      code: styledTextLink(config),
      height: 60,
    },
    {
      title: "CTA Text Link Card",
      description: "Card-style link with headline, description, and call-to-action. Great for sidebars and article footers.",
      code: ctaTextLink(config),
      height: 160,
    },
    {
      title: "Deep Link Button",
      description: "Button-style link with embedded ad disclosure. Use in navigation or call-to-action areas.",
      code: deepLink(config),
      height: 80,
    },
    {
      title: "Inline Recommendation",
      description: "Blog-style recommendation block with left border accent. Place between paragraphs.",
      code: inlineRecommendation(config),
      height: 120,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Text Links and Deep Links</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Inline text links, styled buttons, and recommendation blocks. Lightweight and easy to embed anywhere.
        </p>
      </div>

      <AdSettingsPanel
        referralLink={referralLink}
        projects={projects}
        subscriptions={subscriptions}
        onConfigChange={setConfig}
      />

      {links.map((link) => (
        <div key={link.title}>
          <AssetPreview
            title={link.title}
            description={link.description}
            embedCode={link.code}
            previewHeight={link.height}
          />
          <AssetInstructions steps={instructions} complianceNotes={complianceNotes} />
        </div>
      ))}
    </div>
  );
}
