"use client";

import { useState, useEffect } from "react";
import AssetPreview from "@/components/marketing-toolkit/AssetPreview";
import AssetInstructions from "@/components/marketing-toolkit/AssetInstructions";

interface ProductCardAssetsProps {
  referralLink: string;
}

interface ProductItem {
  name: string;
  description: string;
  price: string;
  type: "project" | "subscription";
}

function productCard(item: ProductItem, referralLink: string): string {
  const typeLabel = item.type === "project" ? "Software Project" : "Subscription Plan";
  const gradient = item.type === "project"
    ? "linear-gradient(135deg,#18181b,#292524)"
    : "linear-gradient(135deg,#0f172a,#1e3a5f)";
  const accent = item.type === "project" ? "#f59e0b" : "#38bdf8";

  return `<!-- 14DaysAccel Dev - Product Card: ${item.name} - Sponsored -->
<div style="width:300px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);transition:transform 0.2s,box-shadow 0.2s" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 8px 30px rgba(0,0,0,0.15)'" onmouseout="this.style.transform='translateY(0)';this.style.boxShadow='0 4px 20px rgba(0,0,0,0.1)'">
  <div style="position:relative;background:${gradient};padding:20px;text-align:center">
    <div style="position:absolute;top:8px;right:8px;background:rgba(251,191,36,0.9);color:#78350f;font-size:8px;font-weight:700;padding:2px 5px;border-radius:3px;letter-spacing:0.5px;text-transform:uppercase">Sponsored</div>
    <div style="color:${accent};font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.5px">${typeLabel}</div>
    <div style="color:#fff;font-size:18px;font-weight:700;margin-top:8px;line-height:1.3">${item.name}</div>
  </div>
  <div style="background:#fff;padding:20px">
    <p style="font-size:12px;color:#52525b;line-height:1.6;margin:0 0 16px">${item.description}</p>
    <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:16px">
      <span style="font-size:28px;font-weight:800;color:#18181b">${item.price}</span>
      ${item.type === "subscription" ? '<span style="font-size:12px;color:#71717a">/month</span>' : ""}
    </div>
    <a href="${referralLink}" target="_blank" rel="noopener noreferrer sponsored" style="display:block;text-align:center;background:#18181b;color:#fff;padding:10px;border-radius:6px;font-size:12px;font-weight:600;text-decoration:none;transition:background 0.2s" onmouseover="this.style.background='#3f3f46'" onmouseout="this.style.background='#18181b'">${item.type === "project" ? "View Project" : "Subscribe Now"}</a>
  </div>
</div>`;
}

const instructions = [
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

export default function ProductCardAssets({ referralLink }: ProductCardAssetsProps) {
  const [projects, setProjects] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch("/api/internal/subscriptions");
        const plans = res.ok ? await res.json() : [];

        const items: ProductItem[] = [];

        if (Array.isArray(plans)) {
          plans.forEach((plan: { name?: string; price_usd?: number; tokens_per_month?: number; is_active?: boolean; plan_type?: string }) => {
            if (plan.is_active && plan.plan_type !== "custom") {
              items.push({
                name: plan.name || "Subscription Plan",
                description: `${(plan.tokens_per_month || 0).toLocaleString()} AI tokens per month. Access advanced AI models for software planning and development.`,
                price: `$${plan.price_usd || 0}`,
                type: "subscription",
              });
            }
          });
        }

        if (items.length === 0) {
          items.push(
            {
              name: "Starter Plan",
              description: "AI-powered software planning with essential tokens. Perfect for individual developers.",
              price: "$19",
              type: "subscription",
            },
            {
              name: "Custom Software Project",
              description: "Production-ready application delivered in under 14 days. Full-stack implementation.",
              price: "$200",
              type: "project",
            }
          );
        }

        setProjects(items);
      } catch {
        setProjects([
          {
            name: "Custom Software Project",
            description: "Production-ready application delivered in under 14 days. Full-stack implementation.",
            price: "$200",
            type: "project",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    loadProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-sm text-zinc-500">Loading product cards...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-zinc-900">Product Cards</h2>
        <p className="mt-1 text-sm text-zinc-500">
          Showcase specific projects and subscription plans. Cards feature pricing, descriptions, and a direct referral CTA.
        </p>
      </div>

      {projects.map((item) => (
        <div key={item.name}>
          <AssetPreview
            title={`${item.name} Card`}
            description={`Product card for ${item.name}. ${item.type === "project" ? "Software project" : "Subscription plan"} listing.`}
            embedCode={productCard(item, referralLink)}
            previewHeight={350}
            disclosureLabel="Sponsored"
          />
          <AssetInstructions steps={instructions} complianceNotes={complianceNotes} />
        </div>
      ))}
    </div>
  );
}
