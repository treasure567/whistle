"use client";

import Link from "next/link";

import { PlayerAvatar } from "@/components/ui/player-avatar";
import { GlowCard } from "@/components/ui/glow-card";
import { FlagOrb } from "@/components/ui/flag-orb";
import { SQUADS } from "@/lib/mock/squads";
import type { LineupPlayer, SquadPlayer } from "@/types";
import { cn } from "@/lib/utils";

function benchForSide(
  nation: string,
  starters: ReadonlyArray<LineupPlayer>,
): ReadonlyArray<SquadPlayer> {
  const squad = SQUADS[nation];
  if (!squad) return [];
  const usedJerseys = new Set(starters.map((s) => s.jersey));
  return squad.players
    .filter((p) => p.number != null && !usedJerseys.has(p.number))
    .slice(0, 10);
}

function BenchSide({
  nation,
  starters,
  side,
}: {
  nation: string;
  starters: ReadonlyArray<LineupPlayer>;
  side: "home" | "away";
}) {
  const bench = benchForSide(nation, starters);
  if (bench.length === 0) return null;
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <FlagOrb code={nation} size={18} />
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          {SQUADS[nation]?.country ?? nation} bench
        </span>
        <span
          className={cn(
            "ml-auto h-1.5 w-1.5 rounded-full",
            side === "home" ? "bg-violet-400" : "bg-muted-foreground",
          )}
          aria-hidden
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {bench.map((p) => (
          <GlowCard key={p.id} padding="none">
            <div className="flex items-center gap-2.5 p-2.5">
              <PlayerAvatar src={p.photo} name={p.name} size={32} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] text-foreground">{p.name}</p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  #{p.number} · {p.position?.[0] ?? "?"}
                </p>
              </div>
            </div>
          </GlowCard>
        ))}
      </div>
      <Link
        href={`/teams/${nation}`}
        className="mt-3 inline-block font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground hover:text-violet-500 dark:hover:text-violet-300"
      >
        Full squad →
      </Link>
    </div>
  );
}

interface MatchBenchProps {
  homeCode: string;
  awayCode: string;
  home: ReadonlyArray<LineupPlayer>;
  away: ReadonlyArray<LineupPlayer>;
}

export function MatchBench({ homeCode, awayCode, home, away }: MatchBenchProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <BenchSide nation={homeCode} starters={home} side="home" />
      <BenchSide nation={awayCode} starters={away} side="away" />
    </div>
  );
}
