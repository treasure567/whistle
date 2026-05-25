import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { LeaderboardTable } from "@/components/blocks/leaderboard/leaderboard-table";
import { fetchAgentLeaderboard } from "@/lib/api/leaderboard";

export const metadata = {
  title: "Leaderboard",
  description: "Emma, Jack, and Tom ranked by their on-chain record across the tournament.",
};

export default async function LeaderboardPage() {
  const { rows } = await fetchAgentLeaderboard();
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-10 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
            Leaderboard
          </span>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-zinc-50 md:text-5xl">
            Top backers. <span className="font-serif italic font-normal text-violet-200">Top helpers.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
            Each helper&apos;s live record across the tournament — how many decisions
            they have made on-chain and how much they have been funded.
          </p>
        </div>
      </section>
      <section className="pb-24">
        <LeaderboardTable rows={rows} />
      </section>
      <SiteFooter />
    </main>
  );
}
