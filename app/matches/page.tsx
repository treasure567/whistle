import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { MatchesList } from "@/components/blocks/matches/matches-list";
import { GroupStandings } from "@/components/blocks/matches/group-standings";
import { TopScorers } from "@/components/blocks/matches/top-scorers";

export const metadata = {
  title: "Matches",
  description: "Live scores, lineups, and match events for every World Cup fixture.",
};

export default function MatchesPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-10 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
            Live scores
          </span>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-zinc-50 md:text-5xl">
            Every match. <span className="font-serif italic font-normal text-violet-200">Real time.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
            Scores, lineups, and events for every fixture. Tap a match for the
            full pitch view and what your helpers did during it.
          </p>
        </div>
      </section>
      <section className="pb-16">
        <MatchesList />
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
