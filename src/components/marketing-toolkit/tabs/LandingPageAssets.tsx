"use client";

import { useState } from "react";
import AssetPreview from "@/components/marketing-toolkit/AssetPreview";
import AssetInstructions from "@/components/marketing-toolkit/AssetInstructions";
import AdSettingsPanel from "@/components/marketing-toolkit/AdSettingsPanel";
import type { SubscriptionPlan } from "@/components/marketing-toolkit/AdSettingsPanel";
import type { Project } from "@/types/project";
import type { AdConfig } from "@/types/adConfig";

interface LandingPageAssetsProps {
  referralLink: string;
  projects: Project[];
  subscriptions: SubscriptionPlan[];
}

function minimalLandingPage(c: AdConfig): string {
  const title =
    c.productType === "designer"
      ? "Plan Your Software with AI | 14DaysAccel Dev"
      : c.productType === "subscription"
        ? `${c.productName} | 14DaysAccel Dev`
        : "Get Software Built in 14 Days | 14DaysAccel Dev";
  const headline =
    c.productType === "designer"
      ? "AI-Powered Software Planning"
      : c.productType === "subscription"
        ? `Unlock ${c.productName}`
        : "Production-Ready Software in 14 Days";
  const sub =
    c.productType === "designer"
      ? "Generate security-first architecture, project plans, and technical docs in minutes. Free to use."
      : c.productType === "subscription"
        ? `${c.tagline}. Advanced AI models for real development, starting at ${c.price}.`
        : "Stop waiting months and spending thousands. Get your software built, tested, and deployed fast.";
  const stat1 = c.productType === "designer" ? "AI" : "14";
  const stat1Label = c.productType === "designer" ? "Powered" : "Day Delivery";
  const stat2 = c.price;
  const stat2Label = c.productType === "designer" ? "" : c.productType === "subscription" ? "Per Month" : "Starting Price";

  return `<!-- 14DaysAccel Dev - Minimal Landing Page - Sponsored -->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;background:#fff}
.accel-hero{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:40px 20px;position:relative;overflow:hidden;background:#09090b}
.accel-hero::before{content:'';position:absolute;width:600px;height:600px;border-radius:50%;background:radial-gradient(circle,rgba(14,165,233,0.15),transparent 70%);top:-200px;right:-200px;animation:accelPulse 6s ease-in-out infinite}
.accel-hero::after{content:'';position:absolute;width:400px;height:400px;border-radius:50%;background:radial-gradient(circle,rgba(245,158,11,0.1),transparent 70%);bottom:-100px;left:-100px;animation:accelPulse 6s ease-in-out infinite 3s}
.accel-badge{display:inline-block;background:rgba(251,191,36,0.9);color:#78350f;font-size:10px;font-weight:700;padding:3px 8px;border-radius:4px;letter-spacing:0.5px;text-transform:uppercase;margin-bottom:20px}
.accel-brand{color:#f59e0b;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;position:relative;z-index:1}
.accel-h1{color:#fff;font-size:clamp(32px,5vw,56px);font-weight:800;line-height:1.1;max-width:700px;position:relative;z-index:1;opacity:0;animation:accelFadeUp 0.8s ease-out 0.2s forwards}
.accel-sub{color:#a1a1aa;font-size:clamp(14px,2vw,18px);margin-top:16px;max-width:500px;line-height:1.6;position:relative;z-index:1;opacity:0;animation:accelFadeUp 0.8s ease-out 0.4s forwards}
.accel-cta{display:inline-block;background:#fff;color:#18181b;padding:16px 40px;border-radius:8px;font-size:16px;font-weight:700;text-decoration:none;margin-top:32px;position:relative;z-index:1;transition:transform 0.2s,box-shadow 0.2s;opacity:0;animation:accelFadeUp 0.8s ease-out 0.6s forwards}
.accel-cta:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(255,255,255,0.15)}
.accel-stats{display:flex;gap:48px;margin-top:48px;position:relative;z-index:1;opacity:0;animation:accelFadeUp 0.8s ease-out 0.8s forwards}
.accel-stat-num{color:#fff;font-size:32px;font-weight:800}
.accel-stat-label{color:#71717a;font-size:12px;text-transform:uppercase;letter-spacing:0.5px;margin-top:4px}
.accel-footer{text-align:center;padding:16px;background:#f4f4f5;font-size:11px;color:#71717a}
.accel-footer a{color:#71717a;text-decoration:underline}
@keyframes accelFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
@keyframes accelPulse{0%,100%{transform:scale(1);opacity:0.5}50%{transform:scale(1.1);opacity:0.8}}
@media(max-width:600px){.accel-stats{flex-direction:column;gap:24px}}
</style>
</head>
<body>
<section class="accel-hero">
  <span class="accel-badge">Sponsored</span>
  <div class="accel-brand">14DaysAccel Dev</div>
  <h1 class="accel-h1">${headline}</h1>
  <p class="accel-sub">${sub}</p>
  <a href="${c.referralLink}" class="accel-cta">${c.ctaText}</a>
  <div class="accel-stats">
    <div><div class="accel-stat-num">${stat1}</div><div class="accel-stat-label">${stat1Label}</div></div>
    <div><div class="accel-stat-num">${stat2}</div><div class="accel-stat-label">${stat2Label}</div></div>
    <div><div class="accel-stat-num">100%</div><div class="accel-stat-label">Production Code</div></div>
  </div>
</section>
<footer class="accel-footer">Sponsored content. <a href="${c.referralLink}">14DaysAccel Dev</a></footer>
</body>
</html>`;
}

function featureLandingPage(c: AdConfig): string {
  const heroH1 =
    c.productType === "designer"
      ? "Plan Software Architecture with AI"
      : c.productType === "subscription"
        ? `Why Developers Choose ${c.productName}`
        : "Why Top Teams Choose 14DaysAccel Dev";
  const heroSub =
    c.productType === "designer"
      ? "Security-first project planning, powered by AI. Free."
      : c.productType === "subscription"
        ? `${c.tagline}. AI-powered development from ${c.price}.`
        : "The fastest path from idea to production-ready software.";

  const features =
    c.productType === "designer"
      ? [
          { title: "AI Architecture", desc: "Generate security-first software architecture automatically. No guesswork, just proven patterns." },
          { title: "Free to Use", desc: "The AI Software Planner is completely free. No credit card, no commitment." },
          { title: "Security First", desc: "Every generated plan follows security best practices. Authentication, authorization, and data protection built in." },
          { title: "Export Ready", desc: "Download your project plan, tech stack recommendations, and deployment strategy as a document." },
          { title: "Vibe Code", desc: "Use your plan as a blueprint for AI-assisted coding. Structure meets speed." },
          { title: "Production Grade", desc: "Plans designed for real-world deployment. Scalable, maintainable, and battle-tested patterns." },
        ]
      : c.productType === "subscription"
        ? [
            { title: `${c.tagline}`, desc: "Access advanced AI models for real development work, not toy demos." },
            { title: "Affordable", desc: `Starting at ${c.price}. Scale up as you grow with transparent pricing.` },
            { title: "AI Planning", desc: "Use the AI Software Planner to scope out projects before you write a single line of code." },
            { title: "Full-Stack", desc: "Frontend, backend, database, deployment. Everything handled end-to-end." },
            { title: "Production Quality", desc: "Modern tech stacks, clean architecture, and code that is built to scale." },
            { title: "Transparent", desc: "Track progress, provide feedback, and stay in control throughout the entire build." },
          ]
        : [
            { title: "14-Day Delivery", desc: "From initial concept to deployed, production-ready application. No months of waiting or scope creep." },
            { title: "Fair Pricing", desc: `Projects start at ${c.price}. No hidden fees, no hourly billing surprises. Know your cost upfront.` },
            { title: "Production Quality", desc: "Modern tech stacks, clean architecture, and code that is built to scale. Not prototypes or MVPs." },
            { title: "AI-Powered Planning", desc: "Free AI Software Planner helps you scope your project before committing a single dollar." },
            { title: "Full-Stack", desc: "Frontend, backend, database, deployment. Everything handled end-to-end by experienced engineers." },
            { title: "Transparent Process", desc: "Track progress, provide feedback, and stay in control throughout the entire build." },
          ];

  const bottomH2 =
    c.productType === "designer"
      ? "Ready to plan?"
      : c.productType === "subscription"
        ? "Ready to subscribe?"
        : "Ready to build?";
  const bottomSub =
    c.productType === "designer"
      ? "Generate your first software architecture plan in minutes."
      : c.productType === "subscription"
        ? `Join developers using ${c.productName} to build smarter.`
        : "Join hundreds of businesses shipping software faster with 14DaysAccel Dev.";

  return `<!-- 14DaysAccel Dev - Feature Landing Page - Sponsored -->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Why 14DaysAccel Dev | Ship Software Faster</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#18181b;background:#fff}
.accel-header{background:#18181b;padding:14px 24px;display:flex;justify-content:space-between;align-items:center}
.accel-logo{color:#f59e0b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px}
.accel-header-badge{background:rgba(251,191,36,0.9);color:#78350f;font-size:9px;font-weight:700;padding:2px 6px;border-radius:3px;text-transform:uppercase;letter-spacing:0.5px}
.accel-header-btn{background:#fff;color:#18181b;padding:8px 18px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;transition:opacity 0.2s}
.accel-header-btn:hover{opacity:0.9}
.accel-hero2{background:linear-gradient(180deg,#18181b 0%,#27272a 100%);padding:80px 24px;text-align:center}
.accel-hero2 h1{color:#fff;font-size:clamp(28px,4vw,42px);font-weight:800;line-height:1.2;max-width:600px;margin:0 auto;opacity:0;animation:accelUp 0.6s ease-out 0.1s forwards}
.accel-hero2 p{color:#a1a1aa;font-size:16px;margin:14px auto 0;max-width:480px;opacity:0;animation:accelUp 0.6s ease-out 0.2s forwards}
.accel-features{padding:60px 24px;max-width:900px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:24px}
.accel-feature{padding:24px;border:1px solid #e4e4e7;border-radius:10px;transition:border-color 0.2s}
.accel-feature:hover{border-color:#a1a1aa}
.accel-feature h3{font-size:15px;font-weight:700;margin-bottom:6px}
.accel-feature p{font-size:13px;color:#52525b;line-height:1.6}
.accel-bottom-cta{background:#09090b;padding:60px 24px;text-align:center}
.accel-bottom-cta h2{color:#fff;font-size:28px;font-weight:800;margin-bottom:10px}
.accel-bottom-cta p{color:#a1a1aa;font-size:14px;margin-bottom:24px}
.accel-bottom-cta a{display:inline-block;background:#fff;color:#18181b;padding:14px 36px;border-radius:8px;font-size:14px;font-weight:700;text-decoration:none;transition:transform 0.2s}
.accel-bottom-cta a:hover{transform:translateY(-2px)}
.accel-lp-footer{text-align:center;padding:16px;background:#f4f4f5;font-size:11px;color:#71717a}
.accel-lp-footer a{color:#71717a;text-decoration:underline}
@keyframes accelUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>
<header class="accel-header">
  <div style="display:flex;align-items:center;gap:10px"><span class="accel-logo">14DaysAccel Dev</span><span class="accel-header-badge">Sponsored</span></div>
  <a href="${c.referralLink}" class="accel-header-btn">${c.ctaText}</a>
</header>
<section class="accel-hero2">
  <h1>${heroH1}</h1>
  <p>${heroSub}</p>
</section>
<section class="accel-features">
  ${features.map((f) => `<div class="accel-feature"><h3>${f.title}</h3><p>${f.desc}</p></div>`).join("\n  ")}
</section>
<section class="accel-bottom-cta">
  <h2>${bottomH2}</h2>
  <p>${bottomSub}</p>
  <a href="${c.referralLink}">${c.ctaText}</a>
</section>
<footer class="accel-lp-footer">Sponsored by <a href="${c.referralLink}">14DaysAccel Dev</a></footer>
</body>
</html>`;
}

const instructions = [
  "Use the Ad Settings panel above to choose a product type, select a specific project or plan, and set the target URL. Click 'Apply' to update all landing pages with your settings.",
  "Click 'Copy Code' to copy the entire landing page HTML to your clipboard.",
  "These are complete, standalone HTML pages. Save the code as an .html file and host it on your domain or landing page platform.",
  "Each template is self-contained with embedded CSS and no external dependencies.",
  "Your referral link is embedded in all call-to-action buttons and footer links.",
  "Customize the content (headings, copy) to match your audience while keeping the referral links and sponsored disclosures intact.",
  "The pages are responsive and will adapt to mobile, tablet, and desktop screens.",
  "For best results, host on a custom domain or subdomain (e.g., try-14days.yoursite.com).",
];

const complianceNotes = [
  "Each landing page includes 'Sponsored' disclosure prominently displayed.",
  "Footer sections identify the content as sponsored with a link back to 14DaysAccel Dev.",
  "Do not remove or hide the sponsored disclosure labels.",
  "Ensure your hosting domain is not misleading or impersonating 14DaysAccel Dev.",
];

export default function LandingPageAssets({ referralLink, projects, subscriptions }: LandingPageAssetsProps) {
  const [config, setConfig] = useState<AdConfig>({
    referralLink,
    price: "$200",
    numericPrice: 200,
    productName: "Custom Software Project",
    productType: "project",
    ctaText: "Start Your Project",
    tagline: "Production-ready software in 14 days",
  });

  const pages = [
    {
      title: "Minimal Hero Landing Page",
      description: "Clean, single-section landing page with animated hero, stats, and a strong CTA. High-impact, low distraction.",
      code: minimalLandingPage(config),
      height: 520,
    },
    {
      title: "Feature Landing Page",
      description: "Multi-section page with header, hero, feature grid, and bottom CTA. Great for detailed promotion.",
      code: featureLandingPage(config),
      height: 600,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Landing Page Templates</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Full standalone HTML landing pages. Self-contained with inline CSS. Host on your own domain for maximum conversion.
        </p>
      </div>

      <AdSettingsPanel
        referralLink={referralLink}
        projects={projects}
        subscriptions={subscriptions}
        onConfigChange={setConfig}
      />

      {pages.map((page) => (
        <div key={page.title}>
          <AssetPreview
            title={page.title}
            description={page.description}
            embedCode={page.code}
            previewHeight={page.height}
            disclosureLabel="Sponsored"
          />
          <AssetInstructions steps={instructions} complianceNotes={complianceNotes} />
        </div>
      ))}
    </div>
  );
}
