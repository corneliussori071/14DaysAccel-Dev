"use client";

import { useState } from "react";
import AssetPreview from "@/components/marketing-toolkit/AssetPreview";
import AssetInstructions from "@/components/marketing-toolkit/AssetInstructions";
import AdSettingsPanel from "@/components/marketing-toolkit/AdSettingsPanel";
import type { SubscriptionPlan } from "@/components/marketing-toolkit/AdSettingsPanel";
import type { Project } from "@/types/project";
import type { AdConfig } from "@/types/adConfig";

interface EmailTemplateAssetsProps {
  referralLink: string;
  projects: Project[];
  subscriptions: SubscriptionPlan[];
}

function introEmail(c: AdConfig): string {
  const headline =
    c.productType === "designer"
      ? "Plan Your Next Software Project with AI"
      : c.productType === "subscription"
        ? `Unlock AI-Powered Development with ${c.productName}`
        : "Get Production-Ready Software in 14 Days";
  const bodyText =
    c.productType === "designer"
      ? "I wanted to share a tool that has changed how I plan software projects. The AI Software Planner at 14DaysAccel Dev generates security-first architecture, project plans, and technical documentation in minutes. And it is completely free."
      : c.productType === "subscription"
        ? `I wanted to share a platform that has changed how I approach development. ${c.productName} gives you ${c.tagline} for just ${c.price}. It is a game-changer for planning and building software.`
        : `I wanted to share a platform that has completely changed how I approach software projects. 14DaysAccel Dev delivers production-ready applications in under 14 days, starting at just ${c.price}.`;
  const bullets =
    c.productType === "designer"
      ? ["AI-generated software architecture", "Security-first approach built in", "Free to use, no commitment required", "Export-ready technical documentation"]
      : c.productType === "subscription"
        ? [`${c.tagline}`, "Access to advanced AI models", "Software planning and development tools", `Starting at just ${c.price}`]
        : ["14-day delivery from idea to production", "Full-stack, production-quality code", `Transparent pricing starting at ${c.price}`, "AI-powered software planning tools"];

  return `<!-- 14DaysAccel Dev - Introduction Email Template - Sponsored -->
<div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;line-height:1.6">
  <div style="background:#18181b;padding:24px 32px;text-align:center;border-radius:8px 8px 0 0">
    <div style="color:#f59e0b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px">14DaysAccel Dev</div>
  </div>
  <div style="background:#ffffff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <p style="font-size:9px;color:#78350f;background:#fef3c7;display:inline-block;padding:2px 6px;border-radius:3px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px">Sponsored</p>
    <h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 12px;line-height:1.3">${headline}</h1>
    <p style="font-size:14px;color:#52525b;margin:0 0 8px">Hi there,</p>
    <p style="font-size:14px;color:#52525b;margin:0 0 16px">${bodyText}</p>
    <p style="font-size:14px;color:#52525b;margin:0 0 8px">Here is what makes it different:</p>
    <ul style="font-size:14px;color:#52525b;padding-left:20px;margin:0 0 24px">
      ${bullets.map((b) => `<li style="margin-bottom:6px">${b}</li>`).join("")}
    </ul>
    <div style="text-align:center;margin:24px 0">
      <a href="${c.referralLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#18181b;color:#ffffff;padding:14px 32px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none">${c.ctaText}</a>
    </div>
    <p style="font-size:14px;color:#52525b;margin:0">Worth checking out if you have any software projects in mind.</p>
    <p style="font-size:14px;color:#52525b;margin:16px 0 0">Best regards</p>
  </div>
  <div style="background:#f4f4f5;padding:16px 32px;text-align:center;border-radius:0 0 8px 8px;border:1px solid #e4e4e7;border-top:none">
    <p style="font-size:11px;color:#71717a;margin:0">This is a sponsored recommendation. <a href="${c.referralLink}" style="color:#71717a;text-decoration:underline">Learn more</a></p>
  </div>
</div>`;
}

function promoEmailBody(c: AdConfig): string {
  const headline =
    c.productType === "designer"
      ? "Plan Software 10x Faster with AI"
      : c.productType === "subscription"
        ? `${c.productName} - Build Smarter`
        : "Ship Software 10x Faster";
  const sub =
    c.productType === "designer"
      ? "Free AI planner. Security-first. Ready in minutes."
      : c.productType === "subscription"
        ? `${c.tagline}. AI-powered development from ${c.price}.`
        : `Production-ready in 14 days. Starting at ${c.price}.`;
  const stat2Label = c.price;
  const stat2Sub = c.productType === "subscription" ? "Per Month" : c.productType === "designer" ? "" : "Starting Price";

  return `<div style="background:linear-gradient(135deg,#18181b,#3f3f46);padding:32px;text-align:center;border-radius:8px 8px 0 0">
    <div style="color:#f59e0b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">14DaysAccel Dev</div>
    <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0 0 8px;line-height:1.2">${headline}</h1>
    <p style="color:#a1a1aa;font-size:14px;margin:0">${sub}</p>
  </div>
  <div style="background:#ffffff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <p style="font-size:9px;color:#78350f;background:#fef3c7;display:inline-block;padding:2px 6px;border-radius:3px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 20px">Sponsored</p>
    <table style="width:100%;border-collapse:separate;border-spacing:8px 0;margin-bottom:24px"><tr>
      <td style="text-align:center;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">
        <div style="font-size:24px;font-weight:800;color:#18181b">${c.productType === "designer" ? "AI" : "14"}</div>
        <div style="font-size:11px;color:#71717a;margin-top:2px">${c.productType === "designer" ? "Powered" : "Day Delivery"}</div>
      </td>
      <td style="text-align:center;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">
        <div style="font-size:24px;font-weight:800;color:#18181b">${stat2Label}</div>
        <div style="font-size:11px;color:#71717a;margin-top:2px">${stat2Sub}</div>
      </td>
      <td style="text-align:center;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">
        <div style="font-size:24px;font-weight:800;color:#18181b">100%</div>
        <div style="font-size:11px;color:#71717a;margin-top:2px">Production Ready</div>
      </td>
    </tr></table>
    <p style="font-size:14px;color:#52525b;margin:0 0 24px">${c.productType === "designer" ? "Stop guessing your architecture. The AI Software Planner generates security-first project plans, tech stack recommendations, and deployment strategies in minutes." : `Stop waiting months and spending thousands on software development. 14DaysAccel Dev delivers complete, production-ready applications using battle-tested tech stacks and AI-augmented workflows.`}</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${c.referralLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#18181b;color:#ffffff;padding:14px 40px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none">${c.ctaText}</a>
    </div>
  </div>
  <div style="background:#f4f4f5;padding:16px 32px;text-align:center;border-radius:0 0 8px 8px;border:1px solid #e4e4e7;border-top:none">
    <p style="font-size:11px;color:#71717a;margin:0">Sponsored content. <a href="${c.referralLink}" style="color:#71717a;text-decoration:underline">14DaysAccel Dev</a></p>
  </div>`;
}

function promoEmail(c: AdConfig): string {
  return `<!-- 14DaysAccel Dev - Promotional Email Template - Sponsored -->
<div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;line-height:1.6">
  ${promoEmailBody(c)}
</div>`;
}

function promoEmailPreview(c: AdConfig): string {
  return `<!-- 14DaysAccel Dev - Promotional Email Preview -->
<div style="max-width:600px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;line-height:1.6">
  ${promoEmailBody(c)}
</div>`;
}

function followUpEmailBody(c: AdConfig): string {
  const headline =
    c.productType === "designer"
      ? "Still planning your software project?"
      : c.productType === "subscription"
        ? "Ready to level up your development workflow?"
        : "Still thinking about your software project?";
  const body =
    c.productType === "designer"
      ? "The AI Software Planner can map out your entire project in minutes. No sign-up required, no cost, just results."
      : c.productType === "subscription"
        ? `${c.productName} gives you ${c.tagline} starting at ${c.price}. Access advanced AI models and build smarter.`
        : `I get it, choosing the right development partner is a big decision. Here is why 14DaysAccel Dev might be the right fit:`;
  const features =
    c.productType === "designer"
      ? { fast: "AI-generated architecture in minutes", affordable: "Free, no commitment required", quality: "Security-first, production-grade plans" }
      : c.productType === "subscription"
        ? { fast: `${c.tagline}`, affordable: `Starting at ${c.price}`, quality: "Advanced AI models for real development" }
        : { fast: "From idea to production in 14 days", affordable: `Projects starting at ${c.price}`, quality: "Production-grade code with modern tech stacks" };

  return `<div style="background:#18181b;padding:20px 32px;border-radius:8px 8px 0 0">
    <div style="color:#f59e0b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;text-align:center">14DaysAccel Dev</div>
  </div>
  <div style="background:#ffffff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <p style="font-size:9px;color:#78350f;background:#fef3c7;display:inline-block;padding:2px 6px;border-radius:3px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px">Sponsored</p>
    <h1 style="font-size:20px;font-weight:700;color:#18181b;margin:0 0 12px">${headline}</h1>
    <p style="font-size:14px;color:#52525b;margin:0 0 16px">${body}</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="font-size:13px;color:#0f172a;margin:0 0 8px"><strong>Fast:</strong> ${features.fast}</p>
      <p style="font-size:13px;color:#0f172a;margin:0 0 8px"><strong>Affordable:</strong> ${features.affordable}</p>
      <p style="font-size:13px;color:#0f172a;margin:0"><strong>Quality:</strong> ${features.quality}</p>
    </div>
    <p style="font-size:14px;color:#52525b;margin:0 0 24px">${c.productType === "designer" ? "Try it now and see your project plan come together in real time." : "The best part? You can start with the free AI Software Planner to scope out your project before committing."}</p>
    <div style="text-align:center">
      <a href="${c.referralLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#18181b;color:#ffffff;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none">${c.ctaText}</a>
    </div>
  </div>
  <div style="background:#f4f4f5;padding:16px 32px;text-align:center;border-radius:0 0 8px 8px;border:1px solid #e4e4e7;border-top:none">
    <p style="font-size:11px;color:#71717a;margin:0">Sponsored by <a href="${c.referralLink}" style="color:#71717a;text-decoration:underline">14DaysAccel Dev</a></p>
  </div>`;
}

function followUpEmail(c: AdConfig): string {
  return `<!-- 14DaysAccel Dev - Follow-Up Email Template - Sponsored -->
<div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;line-height:1.6">
  ${followUpEmailBody(c)}
</div>`;
}

function followUpEmailPreview(c: AdConfig): string {
  return `<!-- 14DaysAccel Dev - Follow-Up Email Preview -->
<div style="max-width:600px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;line-height:1.6">
  ${followUpEmailBody(c)}
</div>`;
}

const instructions = [
  "Use the Ad Settings panel above to choose a product type, select a specific project or plan, and set the target URL. Click 'Apply' to update all email templates with your settings.",
  "Click 'Copy Code' to copy the email template HTML to your clipboard.",
  "Paste the HTML into your email marketing platform (Mailchimp, ConvertKit, Sendy, etc.) as a custom HTML block.",
  "All styles are inline for maximum email client compatibility (Gmail, Outlook, Apple Mail, etc.).",
  "Replace the greeting and sign-off with your own name or brand for a personal touch.",
  "Your referral link is embedded in all call-to-action buttons and footer links.",
  "Preview the email in your platform before sending to confirm rendering across email clients.",
  "Templates are 600px max-width, the standard for email layouts.",
];

const complianceNotes = [
  "Each template includes a 'Sponsored' disclosure label.",
  "The footer in each email indicates the content is sponsored or an affiliate recommendation.",
  "Ensure your email also includes standard unsubscribe and sender identification as required by CAN-SPAM / GDPR.",
  "Do not present the sponsored content as personal editorial without disclosure.",
];

export default function EmailTemplateAssets({ referralLink, projects, subscriptions }: EmailTemplateAssetsProps) {
  const [config, setConfig] = useState<AdConfig>({
    referralLink,
    price: "$200",
    numericPrice: 200,
    productName: "Custom Software Project",
    productType: "project",
    ctaText: "Explore 14DaysAccel Dev",
    tagline: "Production-ready software in 14 days",
  });

  const templates = [
    {
      title: "Introduction Email",
      description: "Personal recommendation style email. Ideal for first-time outreach about 14DaysAccel Dev.",
      code: introEmail(config),
      previewCode: undefined as string | undefined,
      height: 580,
    },
    {
      title: "Promotional Email",
      description: "Bold promotional format with stats and strong CTA. Great for newsletter features and blasts.",
      code: promoEmail(config),
      previewCode: promoEmailPreview(config),
      height: 620,
    },
    {
      title: "Follow-Up Email",
      description: "Gentle follow-up with key selling points. Use for leads who showed interest but have not converted.",
      code: followUpEmail(config),
      previewCode: followUpEmailPreview(config),
      height: 560,
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Email Templates</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Ready-to-send HTML email templates with inline CSS for email client compatibility. Your referral link is embedded in all CTAs.
        </p>
      </div>

      <AdSettingsPanel
        referralLink={referralLink}
        projects={projects}
        subscriptions={subscriptions}
        onConfigChange={setConfig}
      />

      {templates.map((template) => (
        <div key={template.title}>
          <AssetPreview
            title={template.title}
            description={template.description}
            embedCode={template.code}
            previewCode={template.previewCode}
            previewHeight={template.height}
            disclosureLabel="Sponsored"
          />
          <AssetInstructions steps={instructions} complianceNotes={complianceNotes} />
        </div>
      ))}
    </div>
  );
}
