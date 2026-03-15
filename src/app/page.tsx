import HeroSection from "@/components/sections/HeroSection";
import DevelopmentApproachSection from "@/components/sections/DevelopmentApproachSection";
import FeaturedProjectsSection from "@/components/sections/FeaturedProjectsSection";
import SoftwareIdeaSection from "@/components/sections/SoftwareIdeaSection";
import EngineeringSection from "@/components/sections/EngineeringSection";
import CallToActionSection from "@/components/sections/CallToActionSection";

export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <main className="min-h-screen">
      <HeroSection />
      <DevelopmentApproachSection />
      <FeaturedProjectsSection />
      <SoftwareIdeaSection />
      <EngineeringSection />
      <CallToActionSection />
    </main>
  );
}
