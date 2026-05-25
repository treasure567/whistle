import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
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
      players: list.map((p) => ({ id: p.id, name: p.name, position: p.position, price: p.priceMillions, photo: p.photo })),
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
      <div className="pt-[calc(4rem+1.25rem)] pb-24 md:pt-28">
        <ManagerMode teams={teams} />
      </div>
      <SiteFooter />
    </main>
  );
}
