"use client";

import { EmptyState } from "@/components/ui/empty-state";
import type { MatchStats } from "@/types";
import { cn } from "@/lib/utils";

interface MatchStatsViewProps {
  stats: MatchStats | undefined;
  homeCode: string;
  awayCode: string;
}

interface StatRowProps {
  label: string;
  home: number;
  away: number;
  format?: (n: number) => string;
}

function StatRow({ label, home, away, format }: StatRowProps) {
  const total = Math.max(home + away, 1);
  const homePct = (home / total) * 100;
  const awayPct = (away / total) * 100;
  const homeWinning = home >= away;
  const fmt = format ?? ((n: number) => `${n}`);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-4 font-mono text-xs">
        <span
          className={cn(
            "tabular-nums",
            homeWinning ? "text-violet-500 dark:text-violet-300" : "text-muted-foreground",
          )}
        >
          {fmt(home)}
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "tabular-nums",
            !homeWinning ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {fmt(away)}
        </span>
      </div>
      <div className="flex h-1.5 gap-1">
        <div
          className="rounded-full bg-violet-500/70"
          style={{ width: `${homePct}%` }}
        />
        <div
          className="rounded-full bg-zinc-300/60"
          style={{ width: `${awayPct}%` }}
        />
      </div>
    </div>
  );
}

export function MatchStatsView({
  stats,
  homeCode,
  awayCode,
}: MatchStatsViewProps) {
  if (!stats) {
    return (
      <EmptyState
        label="STATS_PENDING"
        hint="Match statistics will appear once kickoff happens."
      />
    );
  }

  return (
    <div className="space-y-5 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        <span>{homeCode}</span>
        <span className="text-muted-foreground">vs</span>
        <span>{awayCode}</span>
      </div>
      <div className="space-y-4">
        <StatRow
          label="Possession"
          home={stats.possession.home}
          away={stats.possession.away}
          format={(n) => `${n}%`}
        />
        <StatRow label="Shots" home={stats.shots.home} away={stats.shots.away} />
        <StatRow
          label="On target"
          home={stats.shotsOnTarget.home}
          away={stats.shotsOnTarget.away}
        />
        <StatRow label="Corners" home={stats.corners.home} away={stats.corners.away} />
        <StatRow label="Fouls" home={stats.fouls.home} away={stats.fouls.away} />
        <StatRow
          label="Yellow cards"
          home={stats.yellowCards.home}
          away={stats.yellowCards.away}
        />
        <StatRow
          label="Red cards"
          home={stats.redCards.home}
          away={stats.redCards.away}
        />
        <StatRow label="Offsides" home={stats.offsides.home} away={stats.offsides.away} />
        <StatRow label="Passes" home={stats.passes.home} away={stats.passes.away} />
        <StatRow
          label="Pass accuracy"
          home={stats.passAccuracy.home}
          away={stats.passAccuracy.away}
          format={(n) => `${n}%`}
        />
      </div>
    </div>
  );
}
