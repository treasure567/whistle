import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { SimulateView } from "@/components/blocks/simulate/simulate-view";
import { fetchPlayers } from "@/lib/api/players";
import type { PlayerRecord } from "@/lib/api/schemas";
import type { SimTeam } from "@/lib/sim/engine";
import { teamName } from "@/lib/wc-teams";

export const metadata = {
  title: "Match simulator",
  description: "Simulate any World Cup tie in real time — score lines, scorers, cards, and penalties.",
};

function buildTeams(players: PlayerRecord[]): SimTeam[] {
  const byCode = new Map<string, PlayerRecord[]>();
  for (const p of players) {
    const arr = byCode.get(p.teamCode);
    if (arr) arr.push(p);
    else byCode.set(p.teamCode, [p]);
  }
  const teams: SimTeam[] = [];
  for (const [code, list] of byCode) {
    if (list.length < 11) continue;
    const sorted = [...list].sort((a, b) => b.priceMillions - a.priceMillions);
    const top11 = sorted.slice(0, 11).reduce((sum, p) => sum + p.priceMillions, 0);
    teams.push({
      code,
      name: teamName(code),
      players: sorted.slice(0, 16).map((p) => p.name),
      strength: Math.max(0.35, Math.min(0.95, top11 / 130)),
    });
  }
  return teams.sort((a, b) => b.strength - a.strength);
}

export default async function SimulatePage() {
  const players = await fetchPlayers();
  const teams = buildTeams(players);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-8 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
            Match simulator
          </span>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Run the <span className="font-serif italic font-normal text-violet-200">whole tournament.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Pick any tie and watch it play out minute by minute, with goals, scorers, cards and
            penalties. Speed it up or slow it down. Knockout brackets and virtual betting are next.
          </p>
        </div>
      </section>
      <section className="pb-24">
        <SimulateView teams={teams} />
      </section>
      <SiteFooter />
    </main>
  );
}
