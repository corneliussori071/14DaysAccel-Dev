"use client";

import { useState } from "react";
import AssetPreview from "@/components/marketing-toolkit/AssetPreview";
import AssetInstructions from "@/components/marketing-toolkit/AssetInstructions";
import AdSettingsPanel from "@/components/marketing-toolkit/AdSettingsPanel";
import type { SubscriptionPlan } from "@/components/marketing-toolkit/AdSettingsPanel";
import type { Project } from "@/types/project";
import type { AdConfig } from "@/types/adConfig";

interface BannerAssetsProps {
  referralLink: string;
  projects: Project[];
  subscriptions: SubscriptionPlan[];
}

function leaderboardBanner(c: AdConfig): string {
  const headline =
    c.productType === "designer"
      ? "Plan Your Next App with AI"
      : c.productType === "subscription"
        ? `Unlock AI-Powered Development`
        : `Production-Ready Software in 14 Days`;
  const sub =
    c.productType === "designer"
      ? "Free AI Software Planner. Prompt like a pro."
      : c.productType === "subscription"
        ? `${c.productName} - ${c.price}. ${c.tagline}.`
        : `Starting at ${c.price}. Skip months of development.`;
  const cta = c.ctaText;

  return `<!-- 14DaysAccel Dev - Leaderboard Banner (728x90) - Ad -->
<div style="width:728px;max-width:100%;height:90px;position:relative;overflow:hidden;border-radius:8px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;cursor:pointer" onclick="window.open('${c.referralLink}','_blank')">
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,#18181b 0%,#3f3f46 50%,#18181b 100%);animation:bannerShift 4s ease-in-out infinite alternate"></div>
  <div style="position:absolute;top:6px;left:8px;background:rgba(251,191,36,0.9);color:#78350f;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:0.5px;text-transform:uppercase;z-index:2">Ad</div>
  <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;height:100%;padding:0 24px">
    <div>
      <div style="color:#fff;font-size:18px;font-weight:700;letter-spacing:-0.5px">${headline}</div>
      <div style="color:#a1a1aa;font-size:12px;margin-top:2px">${sub}</div>
    </div>
    <div style="background:#fff;color:#18181b;padding:10px 20px;border-radius:6px;font-size:13px;font-weight:600;white-space:nowrap;transition:transform 0.2s;animation:btnPulse 2s ease-in-out infinite">${cta}</div>
  </div>
  <style>@keyframes bannerShift{0%{background-position:0% 50%}100%{background-position:100% 50%}}@keyframes btnPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.05)}}</style>
</div>`;
}

function mediumRectBanner(c: AdConfig): string {
  const headline =
    c.productType === "designer"
      ? "AI Software<br>Planner"
      : c.productType === "subscription"
        ? `${c.productName}<br>Plan`
        : "Ship Software<br>in 14 Days";
  const sub =
    c.productType === "designer"
      ? "Security-first architecture. Free to use."
      : c.productType === "subscription"
        ? `${c.tagline}. ${c.price}.`
        : `From idea to production. Starting at ${c.price}.`;
  const brand =
    c.productType === "designer"
      ? "AI Software Planner"
      : "14DaysAccel Dev";

  return `<!-- 14DaysAccel Dev - Medium Rectangle (300x250) - Ad -->
<div style="width:300px;height:250px;position:relative;overflow:hidden;border-radius:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;cursor:pointer" onclick="window.open('${c.referralLink}','_blank')">
  <div style="position:absolute;inset:0;background:linear-gradient(160deg,#09090b 0%,#1e3a5f 40%,#0ea5e9 100%)"></div>
  <div style="position:absolute;top:8px;right:8px;background:rgba(251,191,36,0.9);color:#78350f;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;letter-spacing:0.5px;text-transform:uppercase;z-index:2">Sponsored</div>
  <div style="position:relative;z-index:1;display:flex;flex-direction:column;justify-content:center;align-items:center;height:100%;padding:24px;text-align:center">
    <div style="color:#38bdf8;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:8px;animation:fadeSlideUp 0.8s ease-out">${brand}</div>
    <div style="color:#fff;font-size:22px;font-weight:700;line-height:1.2;margin-bottom:6px;animation:fadeSlideUp 0.8s ease-out 0.1s both">${headline}</div>
    <div style="color:#94a3b8;font-size:12px;margin-bottom:20px;animation:fadeSlideUp 0.8s ease-out 0.2s both">${sub}</div>
    <div style="background:#fff;color:#0f172a;padding:10px 28px;border-radius:6px;font-size:13px;font-weight:600;animation:fadeSlideUp 0.8s ease-out 0.3s both,btnGlow 2s ease-in-out infinite">${c.ctaText}</div>
  </div>
  <style>@keyframes fadeSlideUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}@keyframes btnGlow{0%,100%{box-shadow:0 0 0 0 rgba(56,189,248,0)}50%{box-shadow:0 0 20px 4px rgba(56,189,248,0.3)}}</style>
</div>`;
}

function skyscraperBannerInner(c: AdConfig): string {
  const headline =
    c.productType === "designer"
      ? "Plan<br>Software<br>with AI"
      : c.productType === "subscription"
        ? "Unlock<br>AI<br>Tokens"
        : "Build<br>Software<br>Faster";
  const sub =
    c.productType === "designer"
      ? "Free AI-powered project planner for developers"
      : c.productType === "subscription"
        ? `${c.tagline}. Start building smarter.`
        : "Production-ready apps delivered in under 14 days";
  const brand =
    c.productType === "designer"
      ? "AI Planner"
      : "14DaysAccel Dev";
  const accentColor =
    c.productType === "designer" ? "#38bdf8" : "#f59e0b";

  return `<div style="position:absolute;inset:0;background:linear-gradient(180deg,#18181b 0%,#292524 50%,#18181b 100%)"></div>
  <div style="position:absolute;top:8px;left:8px;background:rgba(251,191,36,0.9);color:#78350f;font-size:8px;font-weight:700;padding:2px 5px;border-radius:3px;letter-spacing:0.5px;text-transform:uppercase;z-index:2">Ad</div>
  <div style="position:relative;z-index:1;display:flex;flex-direction:column;align-items:center;justify-content:space-between;height:100%;padding:40px 14px 30px;text-align:center">
    <div>
      <div style="color:${accentColor};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px;animation:fadeIn 0.6s ease-out">${brand}</div>
      <div style="color:#fff;font-size:20px;font-weight:700;line-height:1.2;margin-top:16px;animation:fadeIn 0.6s ease-out 0.15s both">${headline}</div>
      <div style="width:30px;height:2px;background:${accentColor};margin:16px auto;animation:fadeIn 0.6s ease-out 0.3s both"></div>
      <div style="color:#a1a1aa;font-size:11px;line-height:1.5;animation:fadeIn 0.6s ease-out 0.4s both">${sub}</div>
    </div>
    <div>
      <div style="color:${accentColor};font-size:32px;font-weight:800;animation:fadeIn 0.6s ease-out 0.5s both">${c.price}</div>
      <div style="color:#71717a;font-size:10px;margin-top:2px;animation:fadeIn 0.6s ease-out 0.55s both">${c.productType === "subscription" ? "Per month" : c.productType === "designer" ? "No cost" : "Starting price"}</div>
      <div style="background:${accentColor};color:#18181b;padding:10px 24px;border-radius:6px;font-size:12px;font-weight:700;margin-top:16px;animation:fadeIn 0.6s ease-out 0.6s both">${c.ctaText}</div>
    </div>
  </div>
  <style>@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}</style>`;
}

function skyscraperBanner(c: AdConfig): string {
  return `<!-- 14DaysAccel Dev - Skyscraper (160x600) - Ad -->
<div style="width:160px;height:600px;position:relative;overflow:hidden;border-radius:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;cursor:pointer" onclick="window.open('${c.referralLink}','_blank')">
  ${skyscraperBannerInner(c)}
</div>`;
}

function skyscraperBannerPreview(c: AdConfig): string {
  return `<!-- 14DaysAccel Dev - Skyscraper Preview -->
<div style="width:160px;height:600px;position:relative;overflow:hidden;border-radius:10px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  ${skyscraperBannerInner(c)}
</div>`;
}

function mobileBannerInner(c: AdConfig): string {
  const headline =
    c.productType === "designer"
      ? "AI Software Planner"
      : c.productType === "subscription"
        ? c.productName
        : "Software in 14 Days";
  const sub =
    c.productType === "designer"
      ? "Start for free. Plan smarter."
      : `From ${c.price}. Ship faster.`;

  return `<div style="position:absolute;inset:0;background:linear-gradient(90deg,#18181b 0%,#1e3a5f 100%)"></div>
  <div style="position:absolute;top:4px;left:6px;background:rgba(251,191,36,0.9);color:#78350f;font-size:7px;font-weight:700;padding:1px 4px;border-radius:2px;letter-spacing:0.5px;text-transform:uppercase;z-index:2">Ad</div>
  <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;height:100%;padding:0 12px 0 32px">
    <div>
      <div style="color:#fff;font-size:13px;font-weight:700">${headline}</div>
      <div style="color:#94a3b8;font-size:10px">${sub}</div>
    </div>
    <div style="background:#0ea5e9;color:#fff;padding:6px 14px;border-radius:4px;font-size:11px;font-weight:600;white-space:nowrap;animation:mobileGlow 2s ease-in-out infinite">${c.ctaText}</div>
  </div>
  <style>@keyframes mobileGlow{0%,100%{box-shadow:0 0 0 0 rgba(14,165,233,0)}50%{box-shadow:0 0 12px 2px rgba(14,165,233,0.4)}}</style>`;
}

function mobileBanner(c: AdConfig): string {
  return `<!-- 14DaysAccel Dev - Mobile Banner (320x50) - Ad -->
<div style="width:320px;max-width:100%;height:50px;position:relative;overflow:hidden;border-radius:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;cursor:pointer" onclick="window.open('${c.referralLink}','_blank')">
  ${mobileBannerInner(c)}
</div>`;
}

function mobileBannerPreview(c: AdConfig): string {
  return `<!-- 14DaysAccel Dev - Mobile Banner Preview -->
<div style="width:320px;max-width:100%;height:50px;position:relative;overflow:hidden;border-radius:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  ${mobileBannerInner(c)}
</div>`
}

const instructions = [
  "Use the Ad Settings panel above to choose a product type, select a specific project or plan, and set the target URL. Click 'Apply' to update all banners with your settings.",
  "Click 'Copy Code' to copy the HTML embed code to your clipboard.",
  "Paste the code into your website's HTML where you want the banner to appear.",
  "The banner is self-contained with inline styles and animations. No external CSS or JS is required.",
  "Your referral link is already embedded. When visitors click the banner, they will be directed through your tracking link.",
  "Test the banner by previewing your page in a browser to confirm it displays correctly.",
  "For responsive behavior, the leaderboard and mobile banners use max-width:100% to adapt to smaller containers.",
];

const complianceNotes = [
  "Each banner includes an 'Ad' or 'Sponsored' disclosure label as required by Google and FTC guidelines.",
  "Do not remove or obscure the disclosure labels.",
  "Ensure the banner placement does not interfere with site navigation or create deceptive click patterns.",
];

export default function BannerAssets({ referralLink, projects, subscriptions }: BannerAssetsProps) {
  const [config, setConfig] = useState<AdConfig>({
    referralLink,
    price: "$200",
    numericPrice: 200,
    productName: "Custom Software Project",
    productType: "project",
    ctaText: "Get Started",
    tagline: "Production-ready software in 14 days",
  });

  const banners = [
    {
      title: "Leaderboard Banner (728 x 90)",
      description: "Standard horizontal banner for website headers and article tops. High visibility placement.",
      code: leaderboardBanner(config),
      previewCode: undefined as string | undefined,
      height: 130,
    },
    {
      title: "Medium Rectangle (300 x 250)",
      description: "Versatile ad unit for sidebars, in-content placement, and article breaks.",
      code: mediumRectBanner(config),
      previewCode: undefined as string | undefined,
      height: 300,
    },
    {
      title: "Skyscraper (160 x 600)",
      description: "Tall vertical banner ideal for website sidebars. Strong visibility with scrolling content.",
      code: skyscraperBanner(config),
      previewCode: skyscraperBannerPreview(config),
      height: 640,
    },
    {
      title: "Mobile Banner (320 x 50)",
      description: "Compact banner optimized for mobile screens and sticky footer placements.",
      code: mobileBanner(config),
      previewCode: mobileBannerPreview(config),
      height: 90,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Banners</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Standard display banners in common ad sizes. Copy the code and embed on your website.
        </p>
      </div>

      <AdSettingsPanel
        referralLink={referralLink}
        projects={projects}
        subscriptions={subscriptions}
        onConfigChange={setConfig}
      />

      {banners.map((banner) => (
        <div key={banner.title}>
          <AssetPreview
            title={banner.title}
            description={banner.description}
            embedCode={banner.code}
            previewCode={banner.previewCode}
            previewHeight={banner.height}
            disclosureLabel="Ad"
          />
          <AssetInstructions steps={instructions} complianceNotes={complianceNotes} />
        </div>
      ))}
    </div>
  );
}
