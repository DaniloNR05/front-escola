import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroSection } from "@/components/HeroSection";
import { UpcomingGames } from "@/components/UpcomingGames";
import { ModalitiesShowcase } from "@/components/ModalitiesShowcase";

const Index = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <HeroSection />
        <UpcomingGames />
        <ModalitiesShowcase />
      </main>
      <SiteFooter />
    </div>
  );
};

export default Index;
