import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { ActivityFeed } from "@/components/blocks/activity/activity-feed";
import { fetchActivity } from "@/lib/api/feed";
import type { AgentSlug } from "@/types";

export const metadata = {
  title: "Activity feed",
  description:
    "Everything Emma, Jack, and Tom do during matches — saved moments, bets, and player picks.",
};

const VALID: ReadonlyArray<AgentSlug> = ["scout", "bookie", "manager"];

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = typeof params.agent === "string" ? params.agent : undefined;
  const initialAgent =
    raw && (VALID as ReadonlyArray<string>).includes(raw)
      ? (raw as AgentSlug)
      : "all";
  const { items } = await fetchActivity();

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-10 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
            Activity feed
          </span>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-5xl">
            Everything they did. <span className="font-serif italic font-normal text-violet-200">In one place.</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Saved highlights, predictions, and team picks from every match.
            Filter by person or type. Tap any entry to see the full details.
          </p>
        </div>
      </section>
      <section className="pb-24">
        <ActivityFeed initialAgent={initialAgent} items={items} />
      </section>
      <SiteFooter />
    </main>
  );
}
