"use client";

import { useState } from "react";
import Link from "next/link";

import { PhotoPitch } from "@/components/ui/photo-pitch";
import { EmptyState } from "@/components/ui/empty-state";
import { ActivityRow, ActivityTableHeader } from "@/components/ui/activity-row";
import { MatchEventsTimeline } from "@/components/blocks/matches/match-events";
import { MatchStatsView } from "@/components/blocks/matches/match-stats-view";
import { MatchBench } from "@/components/blocks/matches/match-bench";
import { ACTIVITY } from "@/lib/mock/activity";
import { statsByMatchId } from "@/lib/mock/match-stats";
import { flagOf } from "@/lib/countries";
import type {
  MatchInfo,
  MatchLineup,
  MatchEvent,
  ActivityItem,
} from "@/types";
import { cn } from "@/lib/utils";

type TabKey = "summary" | "lineups" | "stats";

const TABS: ReadonlyArray<{ key: TabKey; label: string }> = [
  { key: "summary", label: "Summary" },
  { key: "lineups", label: "Lineups" },
  { key: "stats", label: "Statistics" },
];

interface MatchTabsProps {
  match: MatchInfo;
  lineup: MatchLineup | undefined;
  events: ReadonlyArray<MatchEvent>;
}

function FormationChip({
  side,
  flag,
  formation,
}: {
  side: string;
  flag: string;
  formation: string;
}) {
  return (
    <div className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card/80 px-2 py-1 backdrop-blur-sm">
      <span className="text-sm" aria-hidden>
        {flag}
      </span>
      <span className="font-mono text-[10px] tracking-wide text-foreground">{side}</span>
      <span className="font-mono text-[10px] text-muted-foreground">·</span>
      <span className="font-mono text-[10px] text-foreground">{formation}</span>
    </div>
  );
}

function SummaryTab({
  match,
  events,
  matchActivity,
}: {
  match: MatchInfo;
  events: ReadonlyArray<MatchEvent>;
  matchActivity: ReadonlyArray<ActivityItem>;
}) {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
            Match events
          </span>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            Timeline
          </h3>
        </div>
        <MatchEventsTimeline
          events={events}
          homeCode={match.home}
          awayCode={match.away}
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
              Agent activity
            </span>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
              What Emma, Jack, and Tom did
            </h3>
            <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
              Saved highlights, bets, and player picks tied to this match.
            </p>
          </div>
          <Link
            href="/activity"
            className="font-mono text-xs uppercase tracking-[0.16em] text-violet-500 hover:text-violet-600 dark:text-violet-300 dark:hover:text-violet-200"
          >
            Full feed →
          </Link>
        </div>
        {matchActivity.length > 0 ? (
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <ActivityTableHeader />
            <div className="divide-y divide-border">
              {matchActivity.map((item) => (
                <ActivityRow key={item.id} item={item} />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState
            label="AGENTS_IDLE"
            hint="Once helpers are funded for this match, their decisions show up here."
          />
        )}
      </section>
    </div>
  );
}

function LineupsTab({
  match,
  lineup,
}: {
  match: MatchInfo;
  lineup: MatchLineup | undefined;
}) {
  if (!lineup) {
    return (
      <EmptyState
        label="LINEUP_PENDING"
        hint="Starting elevens will appear here closer to kickoff."
      />
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative mx-auto w-full max-w-md">
        <div className="pointer-events-none absolute inset-x-0 -top-2 z-10 flex flex-wrap justify-center gap-2">
          <FormationChip
            side={match.away}
            flag={flagOf(match.away)}
            formation={lineup.awayFormation}
          />
          <FormationChip
            side={match.home}
            flag={flagOf(match.home)}
            formation={lineup.homeFormation}
          />
        </div>
        <PhotoPitch lineup={lineup} />
      </section>

      <section>
        <div className="mb-4">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
            Substitutes
          </span>
          <h3 className="mt-2 text-lg font-semibold tracking-tight text-foreground">
            On the bench
          </h3>
        </div>
        <MatchBench
          homeCode={match.home}
          awayCode={match.away}
          home={lineup.home}
          away={lineup.away}
        />
      </section>
    </div>
  );
}

export function MatchTabs({ match, lineup, events }: MatchTabsProps) {
  const [active, setActive] = useState<TabKey>("summary");
  const matchActivity = ACTIVITY.filter((item) => item.matchId === match.id);
  const stats = statsByMatchId(match.id);

  return (
    <div className="mx-auto w-full max-w-3xl px-6 md:px-10">
      <div className="sticky top-[calc(4rem+0.75rem)] z-20 -mx-6 mb-6 border-b border-border bg-background/85 px-6 backdrop-blur md:-mx-10 md:px-10">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setActive(t.key)}
              className={cn(
                "relative px-3 py-3 font-mono text-[11px] uppercase tracking-[0.18em] transition-colors",
                active === t.key
                  ? "text-violet-500 dark:text-violet-300"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
              {active === t.key && (
                <span
                  aria-hidden
                  className="absolute inset-x-3 -bottom-px h-px bg-violet-500 dark:bg-violet-300"
                />
              )}
            </button>
          ))}
        </div>
      </div>

      {active === "summary" && (
        <SummaryTab match={match} events={events} matchActivity={matchActivity} />
      )}
      {active === "lineups" && <LineupsTab match={match} lineup={lineup} />}
      {active === "stats" && (
        <MatchStatsView stats={stats} homeCode={match.home} awayCode={match.away} />
      )}
    </div>
  );
}
