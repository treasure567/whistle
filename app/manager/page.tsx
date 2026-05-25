import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { ManagerMode, type ManagerTeam } from "@/components/blocks/manager/manager-mode";
import { fetchPlayers } from "@/lib/api/players";
import type { PlayerRecord } from "@/lib/api/schemas";
import { teamName } from "@/lib/wc-teams";

export const metadata = {
  title: "Manager mode",
  description: "Pick your nation, set the difficulty, name your XI and manage them through the World Cup against the AI.",
};

function buildTeams(players: PlayerRecord[]): ManagerTeam[] {
  const byCode = new Map<string, PlayerRecord[]>();
  for (const p of players) {
    const arr = byCode.get(p.teamCode);
    if (arr) arr.push(p);
    else byCode.set(p.teamCode, [p]);
  }
  const teams: ManagerTeam[] = [];
  for (const [code, list] of byCode) {
    if (list.length < 15) continue;
    teams.push({
      code,
      name: teamName(code),
      players: list.map((p) => ({ id: p.id, name: p.name, position: p.position, price: p.priceMillions })),
    });
  }
  return teams.sort((a, b) => a.name.localeCompare(b.name));
}

export default async function ManagerPage() {
  const players = await fetchPlayers();
  const teams = buildTeams(players);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-8 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
            Manager mode
          </span>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">
            You&apos;re the <span className="font-serif italic font-normal text-violet-200">gaffer.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Pick your nation, choose a difficulty, set your formation and XI, then take them out
            against the AI. Substitute, re-shape and play your way through the tournament.
          </p>
        </div>
      </section>
      <section className="pb-24">
        <ManagerMode teams={teams} />
      </section>
      <SiteFooter />
    </main>
  );
}
