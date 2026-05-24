"use client";

import Link from "next/link";

import { MatchClock } from "@/components/ui/match-clock";
import type { MatchInfo } from "@/types";
import { cn } from "@/lib/utils";

interface MatchScoreboardProps {
  match: MatchInfo;
}

export function MatchScoreboard({ match }: MatchScoreboardProps) {
  const showScore = match.phase !== "scheduled";

  return (
    <div className="flex flex-col items-center gap-6 border-b border-white/10 pb-8">
      <MatchClock match={match} size="sm" />

      <div className="grid w-full max-w-sm grid-cols-[1fr_auto_1fr] items-center gap-4">
        <TeamSide flag={match.homeFlag} code={match.home} side="home" />

        <div className="flex items-baseline gap-2 px-2">
          <span className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-50 md:text-3xl">
            {showScore ? match.scoreHome : "—"}
          </span>
          <span className="text-sm text-zinc-600">–</span>
          <span className="text-2xl font-semibold tabular-nums tracking-tight text-zinc-50 md:text-3xl">
            {showScore ? match.scoreAway : "—"}
          </span>
        </div>

        <TeamSide flag={match.awayFlag} code={match.away} side="away" />
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
        Group {match.group}
      </p>
    </div>
  );
}

function TeamSide({
  flag,
  code,
  side,
}: {
  flag: string;
  code: string;
  side: "home" | "away";
}) {
  return (
    <Link
      href={`/teams/${code}`}
      className={cn(
        "flex items-center gap-2 rounded-md px-1.5 py-1 transition-colors hover:bg-white/[0.04]",
        side === "home" ? "justify-end" : "justify-start",
      )}
    >
      {side === "home" ? (
        <>
          <span className="text-lg leading-none" aria-hidden>
            {flag}
          </span>
          <span className="font-mono text-sm tracking-wide text-zinc-300">{code}</span>
        </>
      ) : (
        <>
          <span className="font-mono text-sm tracking-wide text-zinc-300">{code}</span>
          <span className="text-lg leading-none" aria-hidden>
            {flag}
          </span>
        </>
      )}
    </Link>
  );
}
