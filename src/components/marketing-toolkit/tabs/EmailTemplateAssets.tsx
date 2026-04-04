"use client";

import AssetPreview from "@/components/marketing-toolkit/AssetPreview";
import AssetInstructions from "@/components/marketing-toolkit/AssetInstructions";

interface EmailTemplateAssetsProps {
  referralLink: string;
}

function introEmail(referralLink: string): string {
  return `<!-- 14DaysAccel Dev - Introduction Email Template - Sponsored -->
<div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;line-height:1.6">
  <div style="background:#18181b;padding:24px 32px;text-align:center;border-radius:8px 8px 0 0">
    <div style="color:#f59e0b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px">14DaysAccel Dev</div>
  </div>
  <div style="background:#ffffff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <p style="font-size:9px;color:#78350f;background:#fef3c7;display:inline-block;padding:2px 6px;border-radius:3px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px">Sponsored</p>
    <h1 style="font-size:22px;font-weight:700;color:#18181b;margin:0 0 12px;line-height:1.3">Get Production-Ready Software in 14 Days</h1>
    <p style="font-size:14px;color:#52525b;margin:0 0 8px">Hi there,</p>
    <p style="font-size:14px;color:#52525b;margin:0 0 16px">I wanted to share a platform that has completely changed how I approach software projects. 14DaysAccel Dev delivers production-ready applications in under 14 days, starting at just $200.</p>
    <p style="font-size:14px;color:#52525b;margin:0 0 8px">Here is what makes it different:</p>
    <ul style="font-size:14px;color:#52525b;padding-left:20px;margin:0 0 24px">
      <li style="margin-bottom:6px">14-day delivery from idea to production</li>
      <li style="margin-bottom:6px">Full-stack, production-quality code</li>
      <li style="margin-bottom:6px">Transparent pricing starting at $200</li>
      <li style="margin-bottom:6px">AI-powered software planning tools</li>
    </ul>
    <div style="text-align:center;margin:24px 0">
      <a href="${referralLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#18181b;color:#ffffff;padding:14px 32px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none">Explore 14DaysAccel Dev</a>
    </div>
    <p style="font-size:14px;color:#52525b;margin:0">Worth checking out if you have any software projects in mind.</p>
    <p style="font-size:14px;color:#52525b;margin:16px 0 0">Best regards</p>
  </div>
  <div style="background:#f4f4f5;padding:16px 32px;text-align:center;border-radius:0 0 8px 8px;border:1px solid #e4e4e7;border-top:none">
    <p style="font-size:11px;color:#71717a;margin:0">This is a sponsored recommendation. <a href="${referralLink}" style="color:#71717a;text-decoration:underline">Learn more</a></p>
  </div>
</div>`;
}

function promoEmail(referralLink: string): string {
  return `<!-- 14DaysAccel Dev - Promotional Email Template - Sponsored -->
<div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;line-height:1.6">
  <div style="background:linear-gradient(135deg,#18181b,#3f3f46);padding:32px;text-align:center;border-radius:8px 8px 0 0">
    <div style="color:#f59e0b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;margin-bottom:12px">14DaysAccel Dev</div>
    <h1 style="color:#ffffff;font-size:26px;font-weight:800;margin:0 0 8px;line-height:1.2">Ship Software 10x Faster</h1>
    <p style="color:#a1a1aa;font-size:14px;margin:0">Production-ready in 14 days. Starting at $200.</p>
  </div>
  <div style="background:#ffffff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <p style="font-size:9px;color:#78350f;background:#fef3c7;display:inline-block;padding:2px 6px;border-radius:3px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 20px">Sponsored</p>
    <div style="display:flex;gap:16px;margin-bottom:24px">
      <div style="flex:1;text-align:center;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">
        <div style="font-size:24px;font-weight:800;color:#18181b">14</div>
        <div style="font-size:11px;color:#71717a;margin-top:2px">Day Delivery</div>
      </div>
      <div style="flex:1;text-align:center;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">
        <div style="font-size:24px;font-weight:800;color:#18181b">$200</div>
        <div style="font-size:11px;color:#71717a;margin-top:2px">Starting Price</div>
      </div>
      <div style="flex:1;text-align:center;padding:16px;background:#f8fafc;border-radius:8px;border:1px solid #e2e8f0">
        <div style="font-size:24px;font-weight:800;color:#18181b">100%</div>
        <div style="font-size:11px;color:#71717a;margin-top:2px">Production Ready</div>
      </div>
    </div>
    <p style="font-size:14px;color:#52525b;margin:0 0 24px">Stop waiting months and spending thousands on software development. 14DaysAccel Dev delivers complete, production-ready applications using battle-tested tech stacks and AI-augmented workflows.</p>
    <div style="text-align:center;margin:24px 0">
      <a href="${referralLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#18181b;color:#ffffff;padding:14px 40px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none">Get Started Today</a>
    </div>
  </div>
  <div style="background:#f4f4f5;padding:16px 32px;text-align:center;border-radius:0 0 8px 8px;border:1px solid #e4e4e7;border-top:none">
    <p style="font-size:11px;color:#71717a;margin:0">Sponsored content. <a href="${referralLink}" style="color:#71717a;text-decoration:underline">14DaysAccel Dev</a></p>
  </div>
</div>`;
}

function followUpEmail(referralLink: string): string {
  return `<!-- 14DaysAccel Dev - Follow-Up Email Template - Sponsored -->
<div style="max-width:600px;margin:0 auto;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;line-height:1.6">
  <div style="background:#18181b;padding:20px 32px;border-radius:8px 8px 0 0">
    <div style="color:#f59e0b;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:2px;text-align:center">14DaysAccel Dev</div>
  </div>
  <div style="background:#ffffff;padding:32px;border:1px solid #e4e4e7;border-top:none">
    <p style="font-size:9px;color:#78350f;background:#fef3c7;display:inline-block;padding:2px 6px;border-radius:3px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin:0 0 16px">Sponsored</p>
    <h1 style="font-size:20px;font-weight:700;color:#18181b;margin:0 0 12px">Still thinking about your software project?</h1>
    <p style="font-size:14px;color:#52525b;margin:0 0 16px">I get it, choosing the right development partner is a big decision. Here is why 14DaysAccel Dev might be the right fit:</p>
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-bottom:20px">
      <p style="font-size:13px;color:#0f172a;margin:0 0 8px"><strong>Fast:</strong> From idea to production in 14 days</p>
      <p style="font-size:13px;color:#0f172a;margin:0 0 8px"><strong>Affordable:</strong> Projects starting at $200</p>
      <p style="font-size:13px;color:#0f172a;margin:0"><strong>Quality:</strong> Production-grade code with modern tech stacks</p>
    </div>
    <p style="font-size:14px;color:#52525b;margin:0 0 24px">The best part? You can start with the free AI Software Planner to scope out your project before committing.</p>
    <div style="text-align:center">
      <a href="${referralLink}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background:#18181b;color:#ffffff;padding:12px 28px;border-radius:6px;font-size:14px;font-weight:600;text-decoration:none">Try the Free Planner</a>
    </div>
  </div>
  <div style="background:#f4f4f5;padding:16px 32px;text-align:center;border-radius:0 0 8px 8px;border:1px solid #e4e4e7;border-top:none">
    <p style="font-size:11px;color:#71717a;margin:0">Sponsored by <a href="${referralLink}" style="color:#71717a;text-decoration:underline">14DaysAccel Dev</a></p>
  </div>
</div>`;
}

const instructions = [
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

export default function EmailTemplateAssets({ referralLink }: EmailTemplateAssetsProps) {
  const templates = [
    {
      title: "Introduction Email",
      description: "Personal recommendation style email. Ideal for first-time outreach about 14DaysAccel Dev.",
      code: introEmail(referralLink),
      height: 580,
    },
    {
      title: "Promotional Email",
      description: "Bold promotional format with stats and strong CTA. Great for newsletter features and blasts.",
      code: promoEmail(referralLink),
      height: 560,
    },
    {
      title: "Follow-Up Email",
      description: "Gentle follow-up with key selling points. Use for leads who showed interest but have not converted.",
      code: followUpEmail(referralLink),
      height: 520,
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

      {templates.map((template) => (
        <div key={template.title}>
          <AssetPreview
            title={template.title}
            description={template.description}
            embedCode={template.code}
            previewHeight={template.height}
            disclosureLabel="Sponsored"
          />
          <AssetInstructions steps={instructions} complianceNotes={complianceNotes} />
        </div>
      ))}
    </div>
  );
}
