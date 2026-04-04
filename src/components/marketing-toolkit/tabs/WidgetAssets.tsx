"use client";

import { useState } from "react";
import AssetPreview from "@/components/marketing-toolkit/AssetPreview";
import AssetInstructions from "@/components/marketing-toolkit/AssetInstructions";
import AdSettingsPanel from "@/components/marketing-toolkit/AdSettingsPanel";
import type { SubscriptionPlan } from "@/components/marketing-toolkit/AdSettingsPanel";
import type { Project } from "@/types/project";
import type { AdConfig } from "@/types/adConfig";

interface WidgetAssetsProps {
  referralLink: string;
  projects: Project[];
  subscriptions: SubscriptionPlan[];
}

function sidebarWidget(c: AdConfig): string {
  const headline =
    c.productType === "designer"
      ? "Plan Your Software with AI"
      : c.productType === "subscription"
        ? `${c.productName}`
        : "Get Your Software Built in 14 Days";
  const sub =
    c.productType === "designer"
      ? "Free AI-powered project planner. Security-first architecture. No sign-up required to start."
      : c.productType === "subscription"
        ? `${c.tagline}. Access advanced AI models for software planning and development.`
        : `Production-ready applications starting at ${c.price}. No months of waiting.`;
  const bullets =
    c.productType === "designer"
      ? ["AI-generated architecture", "Security-first approach", "Free to use"]
      : c.productType === "subscription"
        ? [`${c.tagline}`, "Advanced AI models", `${c.price}`]
        : ["Rapid 14-day delivery", "Production-quality code", `Starting at ${c.price}`];

  return `<!-- 14DaysAccel Dev - Sidebar Widget - Sponsored -->
<div id="accel-sidebar-widget" style="width:280px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.12);animation:accelSlideIn 0.5s ease-out">
  <div style="position:relative;background:linear-gradient(135deg,#18181b,#292524);padding:20px;text-align:center">
    <div style="position:absolute;top:8px;right:8px;background:rgba(251,191,36,0.9);color:#78350f;font-size:8px;font-weight:700;padding:2px 5px;border-radius:3px;letter-spacing:0.5px;text-transform:uppercase">Sponsored</div>
    <div style="color:#f59e0b;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px">14DaysAccel Dev</div>
    <div style="color:#fff;font-size:18px;font-weight:700;margin-top:8px;line-height:1.3">${headline}</div>
    <div style="color:#a1a1aa;font-size:12px;margin-top:6px;line-height:1.5">${sub}</div>
  </div>
  <div style="background:#fff;padding:16px 20px">
    ${bullets.map((b) => `<div style="display:flex;align-items:center;gap:8px;margin-bottom:12px"><div style="width:6px;height:6px;border-radius:50%;background:#22c55e"></div><span style="font-size:11px;color:#52525b">${b}</span></div>`).join("")}
    <a href="${c.referralLink}" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;background:#18181b;color:#fff;padding:10px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;transition:background 0.2s" onmouseover="this.style.background='#3f3f46'" onmouseout="this.style.background='#18181b'">${c.ctaText}</a>
  </div>
  <style>@keyframes accelSlideIn{from{opacity:0;transform:translateX(20px)}to{opacity:1;transform:translateX(0)}}</style>
</div>`;
}

function floatingWidget(c: AdConfig): string {
  const headline =
    c.productType === "designer"
      ? "Plan Software with AI"
      : c.productType === "subscription"
        ? `${c.productName}`
        : "Need Software Built Fast?";
  const sub =
    c.productType === "designer"
      ? "Free AI planner. No sign-up."
      : c.productType === "subscription"
        ? `${c.price}. ${c.tagline}.`
        : `14-day delivery. From ${c.price}.`;

  return `<!-- 14DaysAccel Dev - Floating Widget - Sponsored -->
<div id="accel-floating-widget" style="position:fixed;bottom:20px;right:20px;z-index:9998;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;animation:accelFloatIn 0.6s cubic-bezier(0.16,1,0.3,1)">
  <div style="position:relative;width:300px;max-width:calc(100vw - 40px);border-radius:12px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.18)">
    <button onclick="document.getElementById('accel-floating-widget').style.display='none'" style="position:absolute;top:8px;right:8px;z-index:2;background:rgba(255,255,255,0.2);border:none;color:#fff;width:24px;height:24px;border-radius:50%;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(4px);transition:background 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.4)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'" aria-label="Close">&#10005;</button>
    <div style="position:absolute;top:8px;left:8px;background:rgba(251,191,36,0.9);color:#78350f;font-size:8px;font-weight:700;padding:2px 5px;border-radius:3px;letter-spacing:0.5px;text-transform:uppercase;z-index:2">Sponsored</div>
    <div style="background:linear-gradient(135deg,#0f172a,#1e3a5f);padding:24px 20px 16px;text-align:center">
      <div style="color:#38bdf8;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px">14DaysAccel Dev</div>
      <div style="color:#fff;font-size:16px;font-weight:700;margin-top:6px;line-height:1.3">${headline}</div>
      <div style="color:#94a3b8;font-size:11px;margin-top:4px">${sub}</div>
    </div>
    <div style="background:#fff;padding:14px 20px">
      <a href="${c.referralLink}" target="_blank" rel="noopener noreferrer" style="display:block;text-align:center;background:linear-gradient(135deg,#0ea5e9,#2563eb);color:#fff;padding:10px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;transition:opacity 0.2s" onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">${c.ctaText}</a>
    </div>
  </div>
  <style>@keyframes accelFloatIn{from{opacity:0;transform:translateY(30px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}</style>
</div>`;
}

const instructions = [
  "Click 'Copy Code' to copy the widget HTML to your clipboard.",
  "For the sidebar widget, paste the code into a sidebar column or any container that is approximately 280px wide.",
  "For the floating widget, paste the code just before the closing </body> tag. It uses fixed positioning and will appear in the bottom-right corner.",
  "The floating widget includes a close button that hides it when clicked. Visitors can dismiss it at any time.",
  "Your referral link is embedded in all clickable elements. Clicks are tracked automatically.",
  "Both widgets are self-contained and require no external dependencies.",
];

const complianceNotes = [
  "Each widget displays a 'Sponsored' label as required by advertising disclosure guidelines.",
  "The floating widget includes a clearly visible close button for user control.",
  "Do not auto-reopen the floating widget after a user has dismissed it in the same session.",
];

export default function WidgetAssets({ referralLink, projects, subscriptions }: WidgetAssetsProps) {
  const [config, setConfig] = useState<AdConfig>({
    referralLink,
    price: "$200",
    numericPrice: 200,
    productName: "Custom Software Project",
    productType: "project",
    ctaText: "Get Started Today",
    tagline: "Production-ready software in 14 days",
  });

  const widgets = [
    {
      title: "Sidebar Widget",
      description: "Compact widget designed for website sidebars. Features key selling points and a call-to-action.",
      code: sidebarWidget(config),
      height: 340,
    },
    {
      title: "Floating Widget",
      description: "Fixed-position widget that appears in the bottom-right corner. Includes a close button for user control.",
      code: floatingWidget(config),
      height: 280,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Widgets</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Embeddable widgets for sidebars, footers, and floating placements.
        </p>
      </div>

      <AdSettingsPanel
        referralLink={referralLink}
        projects={projects}
        subscriptions={subscriptions}
        onConfigChange={setConfig}
      />

      {widgets.map((widget) => (
        <div key={widget.title}>
          <AssetPreview
            title={widget.title}
            description={widget.description}
            embedCode={widget.code}
            previewHeight={widget.height}
            disclosureLabel="Sponsored"
          />
          <AssetInstructions steps={instructions} complianceNotes={complianceNotes} />
        </div>
      ))}
    </div>
  );
}
