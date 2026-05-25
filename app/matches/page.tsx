import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { MatchesList } from "@/components/blocks/matches/matches-list";
import { GroupStandings } from "@/components/blocks/matches/group-standings";
import { TopScorers } from "@/components/blocks/matches/top-scorers";
import { fetchMatches } from "@/lib/api/matches";

export const metadata = {
  title: "Matches",
  description: "Live scores, lineups, and match events for every World Cup fixture.",
};

export default async function MatchesPage() {
  const { matches } = await fetchMatches();
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+2rem)] pb-10 md:pt-28">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <MatchesList matches={matches} />
      </section>
      <section className="pb-16">
        <GroupStandings />
      </section>
      <section className="pb-24">
        <TopScorers />
      </section>
      <SiteFooter />
    </main>
  );
}
