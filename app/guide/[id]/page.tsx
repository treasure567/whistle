import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { MatchGuide } from "@/components/blocks/matches/match-guide";
import { fetchFixtures } from "@/lib/api/fixtures";
import { fetchPlayers } from "@/lib/api/players";
import type { PlayerRecord } from "@/lib/api/schemas";
import { teamName } from "@/lib/wc-teams";

function keyPlayers(players: PlayerRecord[], code: string): PlayerRecord[] {
  return players
    .filter((p) => p.teamCode === code)
    .sort((a, b) => b.priceMillions - a.priceMillions)
    .slice(0, 5);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { fixtures } = await fetchFixtures();
  const fixture = fixtures.find((f) => f.id === decodeURIComponent(id));
  if (!fixture) return { title: "Match guide" };
  return { title: `${teamName(fixture.homeCode)} v ${teamName(fixture.awayCode)} · Jack's read` };
}

export default async function GuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const [{ fixtures }, players] = await Promise.all([fetchFixtures(), fetchPlayers()]);
  const fixture = fixtures.find((f) => f.id === decoded);
  if (!fixture) notFound();

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <div className="pt-16">
        <MatchGuide
          match={{
            home: teamName(fixture.homeCode),
            away: teamName(fixture.awayCode),
            homeCode: fixture.homeCode,
            awayCode: fixture.awayCode,
            venue: fixture.venue,
            city: fixture.city,
            kickoffAt: fixture.kickoffAt,
          }}
          homePlayers={keyPlayers(players, fixture.homeCode)}
          awayPlayers={keyPlayers(players, fixture.awayCode)}
        />
      </div>
      <SiteFooter />
    </main>
  );
}
