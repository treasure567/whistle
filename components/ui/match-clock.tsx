"use client";

import { useEffect, useState } from "react";

import type { MatchInfo } from "@/types";
import { formatMatchMinute } from "@/lib/format";
import { cn } from "@/lib/utils";

interface MatchClockProps {
  match: MatchInfo;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function MatchClock({ match, className, size = "md" }: MatchClockProps) {
  const [minute, setMinute] = useState(match.minute ?? 0);

  useEffect(() => {
    if (match.phase !== "first-half" && match.phase !== "second-half") return;
    const start = Date.now();
    const startMinute = match.minute ?? 0;
    const id = window.setInterval(() => {
      const elapsedMs = Date.now() - start;
      const next = startMinute + Math.floor(elapsedMs / 60_000);
      if (next > 120) return;
      setMinute(next);
    }, 5_000);
    return () => window.clearInterval(id);
  }, [match.minute, match.phase]);

  const sizes = {
    sm: { container: "px-3 py-1 text-[10px]", dot: 4 },
    md: { container: "px-3.5 py-1.5 text-[11px]", dot: 6 },
    lg: { container: "px-5 py-2 text-[12px]", dot: 8 },
  } as const;

  const isLive =
    match.phase === "first-half" ||
    match.phase === "second-half" ||
    match.phase === "extra-time";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border font-mono uppercase tracking-[0.18em]",
        isLive
          ? "border-0 bg-transparent text-red-200"
          : match.phase === "scheduled" || match.phase === "kickoff-soon"
          ? "border-violet-500/30 bg-violet-500/5 text-violet-200"
          : "border-white/10 bg-white/5 text-zinc-400",
        sizes[size].container,
        className,
      )}
    >
      {isLive ? (
        <span
          aria-hidden
          className="dot-live"
          style={{ position: "static", width: sizes[size].dot, height: sizes[size].dot }}
        />
      ) : (
        <span
          aria-hidden
          className="rounded-full"
          style={{
            width: sizes[size].dot,
            height: sizes[size].dot,
            background: match.phase === "kickoff-soon" ? "#A78BFA" : "#52525B",
          }}
        />
      )}
      <span>
        {isLive && match.minute !== null
          ? `LIVE · ${formatMatchMinute(minute)}`
          : match.phase === "kickoff-soon"
          ? "KICKOFF SOON"
          : match.phase === "scheduled"
          ? "SCHEDULED"
          : match.phase === "halftime"
          ? "HALFTIME"
          : "FULLTIME"}
      </span>
    </span>
  );
}
