import type { Metadata } from "next";
import MarketingToolkitLayout from "@/components/marketing-toolkit/MarketingToolkitLayout";

export const metadata: Metadata = {
  title: "Marketing Toolkit",
  description:
    "Access marketing assets for the 14DaysAccel Dev affiliate program. Get embeddable banners, widgets, pop-ups, email templates, and more with your referral link built in.",
};

export default function MarketingToolkitPage() {
  return <MarketingToolkitLayout />;
}
