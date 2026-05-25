import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { LeagueStandings } from "@/components/blocks/play/league-standings";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { fetchLeaderboard } from "@/lib/api/leagues";

export const metadata = {
  title: "League standings",
  description: "Live standings for a Whistle league.",
};

export default async function LeagueStandingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const name = typeof sp.name === "string" ? sp.name : "League standings";
  const token = typeof sp.token === "string" ? sp.token : undefined;
  const rows = await fetchLeaderboard(id);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-8 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-3xl px-6 md:px-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
            League
          </span>
          <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">
            {name}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Points come from every player&apos;s match returns. Captains score double. Refresh after
            each round to see the table move.
          </p>
        </div>
      </section>
      <section className="pb-24">
        <LeagueStandings leagueId={id} token={token} initialRows={rows} />
      </section>
      <SiteFooter />
    </main>
  );
}
