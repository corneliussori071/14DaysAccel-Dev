import HeroSection from "@/components/sections/HeroSection";
import SoftwareIdeaSection from "@/components/sections/SoftwareIdeaSection";
import DevelopmentApproachSection from "@/components/sections/DevelopmentApproachSection";
import UpworkCTASection from "@/components/sections/UpworkCTASection";
import FeaturedProjectsSection from "@/components/sections/FeaturedProjectsSection";
import EngineeringSection from "@/components/sections/EngineeringSection";
import CallToActionSection from "@/components/sections/CallToActionSection";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <SoftwareIdeaSection />
      <DevelopmentApproachSection />
      <UpworkCTASection />
      <FeaturedProjectsSection />
      <EngineeringSection />
      <CallToActionSection />
    </main>
  );
}
