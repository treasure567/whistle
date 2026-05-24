import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { SquadGrid } from "@/components/blocks/teams/squad-grid";
import { TeamHeader } from "@/components/blocks/teams/team-header";
import { SQUADS } from "@/lib/mock/squads";

interface PageProps {
  params: Promise<{ code: string }>;
}

export function generateStaticParams() {
  return Object.keys(SQUADS).map((code) => ({ code }));
}

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  const squad = SQUADS[code.toUpperCase()];
  if (!squad) return { title: "Team not found" };
  return {
    title: `${squad.country} squad`,
    description: `${squad.players.length}-player World Cup squad for ${squad.country}.`,
  };
}

export default async function TeamPage({ params }: PageProps) {
  const { code } = await params;
  const squad = SQUADS[code.toUpperCase()];
  if (!squad) notFound();

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pb-6">
        <AmbientGlow position="top" intensity="subtle" size={800} />
        <TeamHeader squad={squad} />
      </section>
      <section className="mx-auto w-full max-w-5xl px-6 pb-24 md:px-10">
        <SquadGrid squad={squad} />
      </section>
      <SiteFooter />
    </main>
  );
}
