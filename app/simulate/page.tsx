import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
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
      <div className="pt-[calc(4rem+1.25rem)] pb-24 md:pt-28">
        <SimulateView teams={teams} />
      </div>
      <SiteFooter />
    </main>
  );
}
