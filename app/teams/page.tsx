import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { TeamsIndex } from "@/components/blocks/teams/teams-index";

export const metadata = {
  title: "Teams",
  description: "All 48 nations at the World Cup — squads, crests, and group draw.",
};

export default function TeamsPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-10 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
            Nations
          </span>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-zinc-50 md:text-5xl">
            All 48 teams. <span className="font-serif italic font-normal text-violet-200">One stage.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-400">
            Tap a flag to see the full squad, jersey numbers, and where they sit
            in the group draw.
          </p>
        </div>
      </section>
      <section className="pb-24">
        <TeamsIndex />
      </section>
      <SiteFooter />
    </main>
  );
}
