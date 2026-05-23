import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { ActivityPreview } from "@/components/blocks/landing/activity-preview";
import { AgentsSection } from "@/components/blocks/landing/agents-section";
import { ContractsStrip } from "@/components/blocks/landing/contracts-strip";
import { CTABand } from "@/components/blocks/landing/cta-band";
import { HowItWorks } from "@/components/blocks/landing/how-it-works";
import { LandingHero } from "@/components/blocks/landing/hero";
import { LiveTicker } from "@/components/blocks/landing/live-ticker";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <LandingHero />
      <LiveTicker />
      <AgentsSection />
      <HowItWorks />
      <ActivityPreview />
      <ContractsStrip />
      <CTABand />
      <SiteFooter />
    </main>
  );
}
