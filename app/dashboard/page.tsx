import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { DashboardShell } from "@/components/blocks/dashboard/dashboard-shell";

export const metadata = {
  title: "Dashboard · your stable",
  description:
    "Your active allocations, positions, mints, and rosters across xdev agents on X Layer.",
};

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+2.5rem)] pb-8 md:pt-28">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <DashboardShell />
      </section>
      <SiteFooter />
    </main>
  );
}
