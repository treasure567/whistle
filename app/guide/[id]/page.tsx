import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { MatchGuide } from "@/components/blocks/matches/match-guide";
import { fetchFixtures, type Fixture } from "@/lib/api/fixtures";
import { fetchPlayers } from "@/lib/api/players";
import type { PlayerRecord } from "@/lib/api/schemas";
import { teamName } from "@/lib/wc-teams";

// Resolve a guide id that may be a fixture externalId (wc-49) or a team-code
// pair from the matches list (ARG-MEX). Falls back to a synthetic fixture so a
// guide always renders from the two team codes.
function resolveFixture(fixtures: Fixture[], rawId: string): Fixture | null {
  const id = decodeURIComponent(rawId);
  const direct = fixtures.find((f) => f.id === id);
  if (direct) return direct;
  const parts = id.split("-");
  if (parts.length === 2) {
    const [home, away] = parts as [string, string];
    const match =
      fixtures.find((f) => f.homeCode === home && f.awayCode === away) ??
      fixtures.find((f) => f.homeCode === away && f.awayCode === home);
    if (match) return match;
    if (home.length >= 2 && away.length >= 2) {
      return {
        id,
        matchNumber: null,
        homeCode: home,
        awayCode: away,
        group: null,
        stage: null,
        venue: null,
        city: null,
        kickoffAt: Date.now(),
      };
    }
  }
  return null;
}

function keyPlayers(players: PlayerRecord[], code: string): PlayerRecord[] {
  return players
    .filter((p) => p.teamCode === code)
    .sort((a, b) => b.priceMillions - a.priceMillions)
    .slice(0, 5);
}

function bestXI(players: PlayerRecord[], code: string): PlayerRecord[] {
  const pool = players.filter((p) => p.teamCode === code);
  const pick = (pos: string, n: number) =>
    pool
      .filter((p) => p.position === pos)
      .sort((a, b) => b.priceMillions - a.priceMillions)
      .slice(0, n);
  return [...pick("GK", 1), ...pick("DEF", 4), ...pick("MID", 3), ...pick("FWD", 3)];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { fixtures } = await fetchFixtures();
  const fixture = resolveFixture(fixtures, id);
  if (!fixture) return { title: "Match guide" };
  return { title: `${teamName(fixture.homeCode)} v ${teamName(fixture.awayCode)} · Jack's read` };
}

export default async function GuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [{ fixtures }, players] = await Promise.all([fetchFixtures(), fetchPlayers()]);
  const fixture = resolveFixture(fixtures, id);
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
          homeXI={bestXI(players, fixture.homeCode)}
          awayXI={bestXI(players, fixture.awayCode)}
        />
      </div>
      <SiteFooter />
    </main>
  );
}
