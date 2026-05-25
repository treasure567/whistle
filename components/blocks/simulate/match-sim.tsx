"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { FootballIcon } from "hugeicons-react";

import { FlagOrb } from "@/components/ui/flag-orb";
import { Button } from "@/components/ui/button";
import { simulateMatch, type SimEvent, type SimResult, type SimTeam } from "@/lib/sim/engine";
import { cn } from "@/lib/utils";

const SPEEDS = [
  { label: "0.5x", ms: 1300 },
  { label: "1x", ms: 650 },
  { label: "2x", ms: 320 },
  { label: "4x", ms: 150 },
] as const;

const GOAL_TYPES = new Set<SimEvent["type"]>(["goal", "penalty-goal"]);

export function MatchSim({ home, away }: { home: SimTeam; away: SimTeam }) {
  const [result, setResult] = useState<SimResult | null>(null);
  const [minute, setMinute] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState<number>(650);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing || !result) return;
    timer.current = setInterval(() => {
      setMinute((m) => {
        if (m >= 90) {
          setPlaying(false);
          return 90;
        }
        return m + 1;
      });
    }, speedMs);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing, speedMs, result]);

  const visible = useMemo(
    () => (result ? result.events.filter((e) => e.minute <= minute) : []),
    [result, minute],
  );
  const homeScore = visible.filter((e) => GOAL_TYPES.has(e.type) && e.side === "home").length;
  const awayScore = visible.filter((e) => GOAL_TYPES.has(e.type) && e.side === "away").length;
  const last = visible[visible.length - 1];
  const ballX = !last || last.side === "neutral" ? 50 : last.side === "home" ? (GOAL_TYPES.has(last.type) ? 92 : 68) : GOAL_TYPES.has(last.type) ? 8 : 32;
  const justGoal = last && GOAL_TYPES.has(last.type) && last.minute === minute ? last : null;
  const done = minute >= 90 && !playing && result !== null;

  function kickOff() {
    setResult(simulateMatch(home, away));
    setMinute(0);
    setPlaying(true);
  }
  function replay() {
    setResult(simulateMatch(home, away));
    setMinute(0);
    setPlaying(true);
  }
  function skipToEnd() {
    setPlaying(false);
    setMinute(90);
  }

  const clock = minute >= 90 ? "FT" : minute === 45 ? "HT" : `${minute}'`;

  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card">
      {/* Scoreboard */}
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 border-b border-border bg-gradient-to-b from-emerald-900/30 to-transparent p-6">
        <SideHead team={home} align="end" />
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3 font-mono text-4xl font-semibold tabular-nums text-foreground">
            <span>{homeScore}</span>
            <span className="text-muted-foreground">:</span>
            <span>{awayScore}</span>
          </div>
          <span
            className={cn(
              "mt-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.18em]",
              done ? "border-emerald-500/30 text-emerald-300" : "border-border text-muted-foreground",
            )}
          >
            {result ? clock : "0'"}
          </span>
        </div>
        <SideHead team={away} align="start" />

        <AnimatePresence>
          {justGoal ? (
            <motion.div
              key={`${justGoal.minute}-${justGoal.side}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 -bottom-3 z-10 flex justify-center"
            >
              <span className="inline-flex items-center gap-1.5 rounded-full bg-violet-500 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white shadow-lg">
                <FootballIcon size={12} /> Goal {justGoal.player ?? ""}
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Momentum pitch */}
      <div className="relative h-12 overflow-hidden border-b border-border bg-gradient-to-r from-violet-500/10 via-transparent to-zinc-400/10">
        <div className="absolute inset-y-0 left-1/2 w-px bg-foreground/10" />
        <motion.div
          className="absolute top-1/2 size-3 -translate-y-1/2 rounded-full bg-white shadow"
          animate={{ left: `${ballX}%` }}
          transition={{ type: "spring", stiffness: 120, damping: 18 }}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
        {!result ? (
          <Button variant="violet" size="sm" onClick={kickOff}>
            <FootballIcon size={14} /> Kick off
          </Button>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={() => setPlaying((p) => !p)} disabled={done}>
              {playing ? "Pause" : "Play"}
            </Button>
            <div className="flex items-center gap-1">
              {SPEEDS.map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => setSpeedMs(s.ms)}
                  className={cn(
                    "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] transition-colors",
                    speedMs === s.ms
                      ? "border-violet-400/50 bg-violet-500/[0.1] text-violet-100"
                      : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <Button variant="ghost" size="sm" onClick={skipToEnd} disabled={done}>
              Skip to FT
            </Button>
            <Button variant="ghost" size="sm" onClick={replay}>
              {done ? "Play again" : "Re-sim"}
            </Button>
          </>
        )}
      </div>

      {/* Event feed */}
      <div className="max-h-[22rem] overflow-y-auto p-4">
        {!result ? (
          <p className="py-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Kick off to simulate the match
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {[...visible].reverse().map((e, i) => (
              <EventRow key={`${e.minute}-${e.type}-${i}`} event={e} home={home} away={away} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function SideHead({ team, align }: { team: SimTeam; align: "start" | "end" }) {
  return (
    <div className={cn("flex items-center gap-3", align === "end" ? "justify-end" : "justify-start")}>
      {align === "start" ? <FlagOrb code={team.code} size={36} /> : null}
      <span className="truncate text-sm font-semibold text-foreground">{team.name}</span>
      {align === "end" ? <FlagOrb code={team.code} size={36} /> : null}
    </div>
  );
}

function EventRow({ event, home, away }: { event: SimEvent; home: SimTeam; away: SimTeam }) {
  const meta = EVENT_META[event.type];
  const isBig = GOAL_TYPES.has(event.type) || event.type === "red";
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-xl border px-3 py-2",
        isBig ? "border-violet-400/30 bg-violet-500/[0.05]" : "border-border bg-foreground/[0.02]",
      )}
    >
      <span className="w-8 shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground">
        {event.type === "kickoff" || event.type === "halftime" || event.type === "fulltime" ? "" : `${event.minute}'`}
      </span>
      <span className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[10px]", meta.badge)}>
        {meta.glyph}
      </span>
      <span className={cn("min-w-0 flex-1 truncate text-[13px]", isBig ? "font-semibold text-foreground" : "text-muted-foreground")}>
        {event.text}
      </span>
      {event.side !== "neutral" ? (
        <FlagOrb code={event.side === "home" ? home.code : away.code} size={18} />
      ) : null}
    </li>
  );
}

const EVENT_META: Record<SimEvent["type"], { glyph: string; badge: string }> = {
  kickoff: { glyph: "•", badge: "bg-foreground/10 text-muted-foreground" },
  goal: { glyph: "⚽", badge: "bg-violet-500 text-white" },
  "penalty-goal": { glyph: "⚽", badge: "bg-violet-500 text-white" },
  "penalty-miss": { glyph: "✕", badge: "bg-amber-500/20 text-amber-300" },
  chance: { glyph: "↗", badge: "bg-foreground/10 text-muted-foreground" },
  save: { glyph: "✋", badge: "bg-sky-500/20 text-sky-300" },
  yellow: { glyph: "▮", badge: "bg-amber-400/30 text-amber-300" },
  red: { glyph: "▮", badge: "bg-red-500/30 text-red-300" },
  halftime: { glyph: "⏸", badge: "bg-foreground/10 text-muted-foreground" },
  fulltime: { glyph: "⏹", badge: "bg-emerald-500/20 text-emerald-300" },
};
