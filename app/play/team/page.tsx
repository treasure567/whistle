import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { TeamBuilder } from "@/components/blocks/play/team-builder";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { fetchPlayers } from "@/lib/api/players";

export const metadata = {
  title: "Pick your players",
  description:
    "Build a 15-player squad inside a budget. Choose your starting XI and captain, then save your team.",
};

export default async function TeamPage() {
  const players = await fetchPlayers();

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-8 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
            Pick your players
          </span>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Build your <span className="font-serif italic font-normal text-violet-200">starting XI.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Fifteen players, one budget. Two keepers, five defenders, five midfielders, three
            forwards. Pick eleven to start and name a captain to double their points.
          </p>
        </div>
      </section>
      <section className="pb-24">
        <TeamBuilder players={players} />
      </section>
      <SiteFooter />
    </main>
  );
}
