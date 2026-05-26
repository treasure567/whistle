import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { PredictView } from "@/components/blocks/play/predict-view";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { fetchFixtures } from "@/lib/api/fixtures";

export const metadata = {
  title: "Predictions",
  description:
    "Call the match result, both teams to score, and more. Your prediction record is kept honestly.",
};

export default async function PredictPage({
  searchParams,
}: {
  searchParams: Promise<{ match?: string }>;
}) {
  const [{ fixtures }, sp] = await Promise.all([fetchFixtures(), searchParams]);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-8 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
            Predictions
          </span>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Make the <span className="font-serif-italic text-violet-200">call.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            This is Jack&apos;s job when you fund him. Want to back your own read instead? Pick a
            match, choose a market, and lock it in. Every call is recorded.
          </p>
        </div>
      </section>
      <section className="pb-24">
        <PredictView fixtures={fixtures} {...(sp.match ? { initialMatchId: sp.match } : {})} />
      </section>
      <SiteFooter />
    </main>
  );
}
