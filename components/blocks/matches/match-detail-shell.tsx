"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { MatchScoreboard } from "@/components/blocks/matches/match-scoreboard";
import { MatchTabs } from "@/components/blocks/matches/match-tabs";
import type { MatchInfo, MatchLineup, MatchEvent } from "@/types";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

interface MatchDetailShellProps {
  match: MatchInfo;
  lineup: MatchLineup | undefined;
  events: ReadonlyArray<MatchEvent>;
}

export function MatchDetailShell({
  match,
  lineup,
  events,
}: MatchDetailShellProps) {
  return (
    <div className="space-y-8 pb-16">
      <div className="mx-auto max-w-2xl px-6 pt-[calc(4rem+1.5rem)] md:px-10 md:pt-24">
        <Link
          href="/matches"
          className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-violet-500 dark:hover:text-violet-300"
        >
          ← All matches
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="mt-6"
        >
          <MatchScoreboard match={match} />
        </motion.div>
      </div>

      <MatchTabs match={match} lineup={lineup} events={events} />
    </div>
  );
}
