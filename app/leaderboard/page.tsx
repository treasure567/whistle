import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { LeaderboardTable } from "@/components/blocks/leaderboard/leaderboard-table";

export const metadata = {
  title: "Leaderboard · top allocators",
  description:
    "Anonymous wallet leaderboard across all three xdev agents on X Layer.",
};

export default function LeaderboardPage() {
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
            Top allocators. <span className="font-serif italic font-normal text-violet-200">Top agents.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
            Anonymous wallets, ranked by realised P&L across the tournament.
            Scout entries rank by significance and mint count. Top three Managers split the prize pool at the final.
          </p>
        </div>
      </section>
      <section className="pb-24">
        <LeaderboardTable />
      </section>
      <SiteFooter />
    </main>
  );
}
