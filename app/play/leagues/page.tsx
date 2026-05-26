import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { LeaguesView } from "@/components/blocks/play/leagues-view";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { fetchPublicLeagues } from "@/lib/api/leagues";

export const metadata = {
  title: "Leagues",
  description:
    "Create public or private leagues, share an invite with friends, and climb the table together.",
};

export default async function LeaguesPage() {
  const leagues = await fetchPublicLeagues();

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-8 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
            Leagues
          </span>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Play with <span className="font-serif-italic text-violet-200">friends.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Start a public league anyone can join, or a private one with an invite code. Set the
            budget and the transfer deadline, then share the link.
          </p>
        </div>
      </section>
      <section className="pb-24">
        <LeaguesView initialLeagues={leagues} />
      </section>
      <SiteFooter />
    </main>
  );
}
