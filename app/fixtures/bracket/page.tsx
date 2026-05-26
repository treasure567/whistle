import Link from "next/link";
import { ArrowLeft01Icon } from "hugeicons-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { BracketView } from "@/components/blocks/fixtures/bracket-view";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { fetchFixtures } from "@/lib/api/fixtures";

export const metadata = {
  title: "Knockout bracket",
  description: "The 2026 World Cup knockout bracket, from the Round of 32 through to the Final.",
};

export default async function BracketPage() {
  const { fixtures } = await fetchFixtures();

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-8 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <Link
            href="/fixtures"
            className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground transition-colors hover:text-zinc-100"
          >
            <ArrowLeft01Icon size={13} />
            Fixtures
          </Link>
          <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">
            The road to the <span className="font-serif-italic text-violet-200">Final.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Thirty-two teams, six rounds, one trophy. The bracket fills in as the group stage
            settles — scroll across to follow every path to July 19.
          </p>
        </div>
      </section>
      <section className="pb-28">
        <BracketView fixtures={fixtures} />
      </section>
      <SiteFooter />
    </main>
  );
}
