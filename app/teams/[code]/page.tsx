import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { SquadGrid } from "@/components/blocks/teams/squad-grid";
import { TeamHeader } from "@/components/blocks/teams/team-header";
import { fetchPlayers } from "@/lib/api/players";
import { WC_TEAMS } from "@/lib/wc-teams";
import type { PlayerPositionValue } from "@/lib/api/schemas";
import type { Squad, SquadPlayer } from "@/types";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ code: string }>;
}

const POSITION_LABEL: Record<PlayerPositionValue, string> = {
  GK: "Goalkeeper",
  DEF: "Defender",
  MID: "Midfielder",
  FWD: "Attacker",
};

export async function generateMetadata({ params }: PageProps) {
  const { code } = await params;
  const team = WC_TEAMS[code.toUpperCase()];
  if (!team) return { title: "Team not found" };
  return {
    title: `${team.name} squad`,
    description: `World Cup squad for ${team.name}.`,
  };
}

export default async function TeamPage({ params }: PageProps) {
  const { code: raw } = await params;
  const code = raw.toUpperCase();
  const team = WC_TEAMS[code];
  if (!team) notFound();

  const players = await fetchPlayers();
  const squadPlayers: SquadPlayer[] = players
    .filter((p) => p.teamCode === code)
    .map((p) => ({
      id: p.id,
      number: null,
      position: POSITION_LABEL[p.position] ?? p.position,
      name: p.name,
      age: null,
      photo: p.photo,
    }));

  const squad: Squad = {
    code,
    country: team.name,
    teamId: 0,
    teamName: team.name,
    logo: "",
    players: squadPlayers,
  };

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
