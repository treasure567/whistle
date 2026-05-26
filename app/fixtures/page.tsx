import Link from "next/link";
import { ArrowRight01Icon } from "hugeicons-react";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { FixturesBoard } from "@/components/blocks/fixtures/fixtures-board";
import { GroupTables } from "@/components/blocks/fixtures/group-tables";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Button } from "@/components/ui/button";
import { ThreeDStadium } from "@/components/ui/three-d-stadium";
import { fetchFixtures } from "@/lib/api/fixtures";

export const metadata = {
  title: "Fixtures",
  description:
    "Every 2026 World Cup match: dates, kick-off times, groups, and venues across Canada, Mexico, and the USA.",
};

export default async function FixturesPage() {
  const { fixtures, source } = await fetchFixtures();

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-10 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto grid max-w-7xl items-center gap-8 px-6 md:grid-cols-[1.3fr_1fr] md:px-10">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
              World Cup 2026 · 48 nations
            </span>
            <h1 className="mt-3 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">
              Every match. <span className="font-serif-italic text-violet-200">One schedule.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
              All 104 fixtures across Canada, Mexico, and the USA — dates, kick-off times, groups,
              and venues. {source === "sample" ? "Showing a sample while the live feed is offline." : "Live from the official schedule."}
            </p>
            <Link href="/fixtures/bracket" className="mt-6 inline-block">
              <Button variant="violet" size="pill">
                View knockout bracket
                <ArrowRight01Icon size={14} />
              </Button>
            </Link>
          </div>
          <div className="relative h-56 md:h-72">
            <ThreeDStadium className="absolute inset-0" />
          </div>
        </div>
      </section>

      <section className="pb-12">
        <GroupTables />
      </section>

      <section className="pb-28">
        <FixturesBoard fixtures={fixtures} />
      </section>

      <SiteFooter />
    </main>
  );
}
