"use client";

import { useState } from "react";
import AssetPreview from "@/components/marketing-toolkit/AssetPreview";
import AssetInstructions from "@/components/marketing-toolkit/AssetInstructions";
import AdSettingsPanel from "@/components/marketing-toolkit/AdSettingsPanel";
import type { SubscriptionPlan } from "@/components/marketing-toolkit/AdSettingsPanel";
import type { Project } from "@/types/project";
import type { AdConfig } from "@/types/adConfig";

interface ComparisonWidgetAssetsProps {
  referralLink: string;
  projects: Project[];
  subscriptions: SubscriptionPlan[];
}

function hiringComparison(c: AdConfig): string {
  const devCost = Math.max(c.numericPrice * 20, 1000);
  const devCostLabel = `$${devCost.toLocaleString()}`;
  const accelPrice = c.price;
  const accelLabel =
    c.productType === "designer"
      ? "AI Software Planner"
      : c.productType === "subscription"
        ? c.productName
        : "14DaysAccel Dev";
  const rightBullets =
    c.productType === "designer"
      ? [
          "AI-generated architecture instantly",
          "Security-first approach",
          "Free to use, no commitment",
          "Proven project templates",
          "Export-ready documentation",
        ]
      : [
          "14-day delivery guaranteed",
          "Production-ready code",
          "Fixed, transparent pricing",
          "Full-stack implementation",
          "Free AI project planner",
        ];

  return `<!-- 14DaysAccel Dev - Comparison Widget: Hiring vs ${accelLabel} - Ad -->
<div style="max-width:560px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1);animation:accelCompIn 0.6s ease-out">
  <div style="background:#18181b;padding:16px 20px;display:flex;align-items:center;justify-content:space-between">
    <div style="color:#fff;font-size:15px;font-weight:700">Which is right for you?</div>
    <span style="background:rgba(251,191,36,0.9);color:#78350f;font-size:8px;font-weight:700;padding:2px 5px;border-radius:3px;letter-spacing:0.5px;text-transform:uppercase">Ad</span>
  </div>
  <div style="display:grid;grid-template-columns:1fr 1fr;background:#fff">
    <!-- Hiring Developers Column -->
    <div style="padding:24px 20px;border-right:1px solid #e4e4e7">
      <div style="font-size:12px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">Hiring Developers</div>
      <div style="margin-bottom:16px"><span style="font-size:32px;font-weight:800;color:#18181b">${devCostLabel}</span><span style="font-size:12px;color:#71717a">+</span></div>
      <div style="space-y:10px">
        <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px"><span style="color:#dc2626;font-size:14px;flex-shrink:0;margin-top:1px">&#10007;</span><span style="font-size:12px;color:#52525b;line-height:1.5">Weeks spent recruiting and interviewing</span></div>
        <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px"><span style="color:#dc2626;font-size:14px;flex-shrink:0;margin-top:1px">&#10007;</span><span style="font-size:12px;color:#52525b;line-height:1.5">Months of development time</span></div>
        <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px"><span style="color:#dc2626;font-size:14px;flex-shrink:0;margin-top:1px">&#10007;</span><span style="font-size:12px;color:#52525b;line-height:1.5">Scope creep and budget overruns</span></div>
        <div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px"><span style="color:#dc2626;font-size:14px;flex-shrink:0;margin-top:1px">&#10007;</span><span style="font-size:12px;color:#52525b;line-height:1.5">Ongoing management overhead</span></div>
        <div style="display:flex;align-items:flex-start;gap:8px"><span style="color:#dc2626;font-size:14px;flex-shrink:0;margin-top:1px">&#10007;</span><span style="font-size:12px;color:#52525b;line-height:1.5">Unpredictable hourly billing</span></div>
      </div>
    </div>
    <!-- ${accelLabel} Column -->
    <div style="padding:24px 20px;background:#f0fdf4;position:relative">
      <div style="position:absolute;top:12px;right:12px;background:#22c55e;color:#fff;font-size:9px;font-weight:700;padding:3px 8px;border-radius:10px;animation:accelBadgePulse 2s ease-in-out infinite">Recommended</div>
      <div style="font-size:12px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:1px;margin-bottom:16px">${accelLabel}</div>
      <div style="margin-bottom:16px"><span style="font-size:32px;font-weight:800;color:#18181b">${accelPrice}</span><span style="font-size:12px;color:#71717a"> ${c.productType === "subscription" ? "/month" : "starting"}</span></div>
      <div>
        ${rightBullets.map((b) => `<div style="display:flex;align-items:flex-start;gap:8px;margin-bottom:10px"><span style="color:#22c55e;font-size:14px;flex-shrink:0;margin-top:1px">&#10003;</span><span style="font-size:12px;color:#052e16;line-height:1.5">${b}</span></div>`).join("")}
      </div>
    </div>
  </div>
  <div style="background:#fff;border-top:1px solid #e4e4e7;padding:16px 20px;text-align:center">
    <a href="${c.referralLink}" target="_blank" rel="noopener noreferrer sponsored" style="display:inline-block;background:#18181b;color:#fff;padding:12px 32px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;transition:background 0.2s" onmouseover="this.style.background='#3f3f46'" onmouseout="this.style.background='#18181b'">${c.ctaText}</a>
  </div>
  <style>@keyframes accelCompIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}@keyframes accelBadgePulse{0%,100%{opacity:1}50%{opacity:0.7}}</style>
</div>`;
}

function costTimeline(c: AdConfig): string {
  const devCost = Math.max(c.numericPrice * 20, 1000);
  const freelancerRange = `$${Math.round(devCost * 0.6).toLocaleString()} - $${Math.round(devCost * 3).toLocaleString()}`;
  const agencyRange = `$${Math.round(devCost * 2).toLocaleString()} - $${Math.round(devCost * 10).toLocaleString()}+`;
  const barLabel =
    c.productType === "designer"
      ? "AI Software Planner"
      : c.productType === "subscription"
        ? c.productName
        : "14DaysAccel Dev";

  return `<!-- 14DaysAccel Dev - Cost and Timeline Comparison - Ad -->
<div style="max-width:480px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.1)">
  <div style="background:linear-gradient(135deg,#18181b,#292524);padding:20px;text-align:center">
    <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:8px">
      <span style="color:#fff;font-size:15px;font-weight:700">The Real Cost of Software Development</span>
      <span style="background:rgba(251,191,36,0.9);color:#78350f;font-size:8px;font-weight:700;padding:2px 5px;border-radius:3px;letter-spacing:0.5px;text-transform:uppercase">Ad</span>
    </div>
    <div style="color:#a1a1aa;font-size:12px">See how ${barLabel} compares</div>
  </div>
  <div style="background:#fff;padding:20px">
    <!-- Freelancer -->
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:12px;font-weight:600;color:#71717a">Freelancers</span>
        <span style="font-size:12px;color:#71717a">${freelancerRange}</span>
      </div>
      <div style="background:#f4f4f5;height:8px;border-radius:4px;overflow:hidden"><div style="width:70%;height:100%;background:linear-gradient(90deg,#fca5a5,#dc2626);border-radius:4px"></div></div>
      <div style="font-size:10px;color:#a1a1aa;margin-top:3px">4-12 weeks typical</div>
    </div>
    <!-- Agency -->
    <div style="margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:12px;font-weight:600;color:#71717a">Agencies</span>
        <span style="font-size:12px;color:#71717a">${agencyRange}</span>
      </div>
      <div style="background:#f4f4f5;height:8px;border-radius:4px;overflow:hidden"><div style="width:95%;height:100%;background:linear-gradient(90deg,#fca5a5,#991b1b);border-radius:4px"></div></div>
      <div style="font-size:10px;color:#a1a1aa;margin-top:3px">8-24 weeks typical</div>
    </div>
    <!-- 14DaysAccel -->
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;margin-bottom:16px">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
        <span style="font-size:12px;font-weight:700;color:#16a34a">${barLabel}</span>
        <span style="font-size:12px;font-weight:700;color:#16a34a">From ${c.price}</span>
      </div>
      <div style="background:#dcfce7;height:8px;border-radius:4px;overflow:hidden"><div style="width:15%;height:100%;background:linear-gradient(90deg,#4ade80,#22c55e);border-radius:4px;animation:accelBarGrow 1s ease-out"></div></div>
      <div style="font-size:10px;color:#16a34a;font-weight:600;margin-top:3px">${c.productType === "designer" ? "Free AI planning. Done in minutes." : "14 days. Done."}</div>
    </div>
    <a href="${c.referralLink}" target="_blank" rel="noopener noreferrer sponsored" style="display:block;text-align:center;background:#18181b;color:#fff;padding:12px;border-radius:6px;font-size:13px;font-weight:600;text-decoration:none;transition:background 0.2s" onmouseover="this.style.background='#3f3f46'" onmouseout="this.style.background='#18181b'">Start for ${c.price}</a>
  </div>
  <style>@keyframes accelBarGrow{from{width:0}to{width:15%}}</style>
</div>`;
}

const instructions = [
  "Use the Ad Settings panel above to choose a product type, select a specific project or plan, and set the target URL. Click 'Apply' to update all comparison widgets with your settings.",
  "Click 'Copy Code' to copy the comparison widget HTML to your clipboard.",
  "Paste the code into blog posts, landing pages, or sidebars where a comparison would be relevant.",
  "The hiring comparison works best in content about software development costs, hiring, or outsourcing.",
  "The cost timeline comparison is ideal for 'how much does it cost to build an app' type content.",
  "Widgets are self-contained with inline styles and animations. No dependencies required.",
  "Your referral link is embedded in the call-to-action button at the bottom.",
];

const complianceNotes = [
  "Each widget includes an 'Ad' disclosure label in the header area.",
  "Comparison data reflects general market ranges scaled to the selected product price.",
  "Do not modify pricing claims to overstate savings or misrepresent competitor pricing.",
  "The 'Recommended' badge indicates an affiliate recommendation, not an editorial endorsement.",
];

export default function ComparisonWidgetAssets({ referralLink, projects, subscriptions }: ComparisonWidgetAssetsProps) {
  const [config, setConfig] = useState<AdConfig>({
    referralLink,
    price: "$200",
    numericPrice: 200,
    productName: "Custom Software Project",
    productType: "project",
    ctaText: "Try 14DaysAccel Dev",
    tagline: "Production-ready software in 14 days",
  });

  const widgets = [
    {
      title: "Hiring Developers vs 14DaysAccel Dev",
      description: "Side-by-side comparison showing traditional hiring pain points versus 14DaysAccel Dev benefits. Developer cost dynamically set to 20x your product price.",
      code: hiringComparison(config),
      height: 480,
    },
    {
      title: "Cost and Timeline Comparison",
      description: "Visual bar chart comparing freelancers, agencies, and 14DaysAccel Dev on cost and timeline. All prices scale dynamically.",
      code: costTimeline(config),
      height: 420,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Comparison Widgets</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Side-by-side comparison widgets that highlight the value of 14DaysAccel Dev versus traditional development options. Developer costs scale to 20x the selected product price.
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
            disclosureLabel="Ad"
          />
          <AssetInstructions steps={instructions} complianceNotes={complianceNotes} />
        </div>
      ))}
    </div>
  );
}
