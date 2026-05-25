"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight01Icon } from "hugeicons-react";

import { MatchClock } from "@/components/ui/match-clock";
import { GlowCard } from "@/components/ui/glow-card";
import { MATCHES } from "@/lib/mock/matches";
import { formatMatchMinute } from "@/lib/format";
import type { MatchInfo, MatchPhase } from "@/types";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

function phaseRank(phase: MatchPhase): number {
  if (phase === "first-half" || phase === "second-half" || phase === "extra-time") return 0;
  if (phase === "kickoff-soon" || phase === "halftime") return 1;
  if (phase === "scheduled") return 2;
  return 3;
}

function groupMatches(matches: ReadonlyArray<MatchInfo>) {
  const live: MatchInfo[] = [];
  const upcoming: MatchInfo[] = [];
  const finished: MatchInfo[] = [];

  for (const match of matches) {
    const rank = phaseRank(match.phase);
    if (rank === 0 || rank === 1) live.push(match);
    else if (rank === 2) upcoming.push(match);
    else finished.push(match);
  }

  live.sort((a, b) => phaseRank(a.phase) - phaseRank(b.phase));
  upcoming.sort((a, b) => a.kickoffAt - b.kickoffAt);
  finished.sort((a, b) => b.kickoffAt - a.kickoffAt);

  return { live, upcoming, finished };
}

function MatchRow({ match, index }: { match: MatchInfo; index: number }) {
  const isLive =
    match.phase === "first-half" ||
    match.phase === "second-half" ||
    match.phase === "extra-time";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ ...spring, delay: index * 0.05 }}
    >
      <Link href={`/guide/${match.id}`} className="group block">
        <GlowCard
          padding="none"
          className="transition-colors hover:border-violet-500/30"
        >
          <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-xl" aria-hidden>
                      {match.homeFlag}
                    </span>
                    <span className="font-mono text-sm tracking-wide text-zinc-100">
                      {match.home}
                    </span>
                  </div>
                  <span className="font-mono text-2xl font-semibold tabular-nums text-zinc-50">
                    {match.phase === "scheduled" ? "—" : match.scoreHome}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="text-xl" aria-hidden>
                      {match.awayFlag}
                    </span>
                    <span className="font-mono text-sm tracking-wide text-zinc-100">
                      {match.away}
                    </span>
                  </div>
                  <span className="font-mono text-2xl font-semibold tabular-nums text-zinc-50">
                    {match.phase === "scheduled" ? "—" : match.scoreAway}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-white/10 pt-4 md:w-56 md:flex-col md:items-end md:border-t-0 md:border-l md:pl-6 md:pt-0">
              <MatchClock match={match} size="sm" />
              <div className="text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  Group {match.group}
                </p>
                <p className="mt-1 text-sm text-zinc-400">{match.venue}</p>
                {isLive && match.minute !== null && (
                  <p className="mt-1 font-mono text-xs text-violet-300">
                    {formatMatchMinute(match.minute)} played
                  </p>
                )}
              </div>
              <ArrowRight01Icon
                className="size-4 text-zinc-600 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-300"
                aria-hidden
              />
            </div>
          </div>
        </GlowCard>
      </Link>
    </motion.div>
  );
}

function MatchSection({
  title,
  matches,
  tone,
}: {
  title: string;
  matches: ReadonlyArray<MatchInfo>;
  tone: "live" | "upcoming" | "finished";
}) {
  if (matches.length === 0) return null;

  const toneClass =
    tone === "live"
      ? "text-red-300"
      : tone === "upcoming"
        ? "text-violet-300"
        : "text-zinc-500";

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3">
        {tone === "live" && (
          <span aria-hidden className="dot-live" style={{ position: "static" }} />
        )}
        <h2 className={cn("font-mono text-xs uppercase tracking-[0.22em]", toneClass)}>
          {title}
        </h2>
        <span className="font-mono text-xs text-zinc-600">{matches.length}</span>
      </div>
      <div className="grid gap-4">
        {matches.map((match, index) => (
          <MatchRow key={match.id} match={match} index={index} />
        ))}
      </div>
    </section>
  );
}

export function MatchesList({
  matches = MATCHES,
}: {
  matches?: ReadonlyArray<MatchInfo>;
}) {
  const { live, upcoming, finished } = groupMatches(matches);

  return (
    <div className="mx-auto max-w-4xl space-y-12 px-6 md:px-10">
      <MatchSection title="Live now" matches={live} tone="live" />
      <MatchSection title="Upcoming" matches={upcoming} tone="upcoming" />
      <MatchSection title="Full time" matches={finished} tone="finished" />
    </div>
  );
}
