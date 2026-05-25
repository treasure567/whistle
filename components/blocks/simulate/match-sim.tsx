"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ChampionIcon, FootballIcon } from "hugeicons-react";

import { FlagOrb } from "@/components/ui/flag-orb";
import { Button } from "@/components/ui/button";
import { matchOdds, simulateMatch, type SimEvent, type SimResult, type SimTeam } from "@/lib/sim/engine";
import { fetchLlmMatch } from "@/lib/sim/llm-match";
import { buildCommentary, type SimComment } from "@/lib/sim/commentary";
import { useVirtualWallet } from "@/hooks/use-virtual-wallet";
import { useOkbBalance } from "@/hooks/use-okb-balance";
import { cn } from "@/lib/utils";

type Pick = "home" | "draw" | "away";

const SPEEDS = [
  { label: "0.5x", ms: 1300 },
  { label: "1x", ms: 650 },
  { label: "2x", ms: 320 },
  { label: "4x", ms: 150 },
] as const;

const GOAL_TYPES = new Set<SimEvent["type"]>(["goal", "penalty-goal"]);

type Coach = { name: string; side: "home" | "away" };

export function MatchSim({
  home,
  away,
  bettable = false,
  coach,
}: {
  home: SimTeam;
  away: SimTeam;
  bettable?: boolean;
  coach?: Coach;
}) {
  const [result, setResult] = useState<SimResult | null>(null);
  const [minute, setMinute] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState<number>(650);
  const [loading, setLoading] = useState(false);
  const [variant, setVariant] = useState(0);
  const [aiModelled, setAiModelled] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const { balance, setBalance } = useVirtualWallet();
  const { balance: onchainOkb } = useOkbBalance();
  const odds = useMemo(() => matchOdds(home.strength, away.strength), [home.strength, away.strength]);
  const [pick, setPick] = useState<Pick>("home");
  const [stake, setStake] = useState(50);
  const [bet, setBet] = useState<{ pick: Pick; stake: number; odds: number } | null>(null);
  const [settled, setSettled] = useState<{ won: boolean; payout: number } | null>(null);

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
  const commentary = useMemo(() => (result ? buildCommentary(result) : []), [result]);
  const visibleComments = useMemo(() => commentary.filter((c) => c.minute <= minute), [commentary, minute]);
  const feedRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    feedRef.current?.scrollTo({ top: feedRef.current.scrollHeight, behavior: "smooth" });
  }, [visibleComments.length]);
  const homeScore = visible.filter((e) => GOAL_TYPES.has(e.type) && e.side === "home").length;
  const awayScore = visible.filter((e) => GOAL_TYPES.has(e.type) && e.side === "away").length;
  const last = visible[visible.length - 1];
  const ballX = !last || last.side === "neutral" ? 50 : last.side === "home" ? (GOAL_TYPES.has(last.type) ? 92 : 68) : GOAL_TYPES.has(last.type) ? 8 : 32;
  const justGoal = last && GOAL_TYPES.has(last.type) && last.minute === minute ? last : null;
  const done = minute >= 90 && !playing && result !== null;

  async function run(nextVariant: number) {
    if (loading) return;
    setLoading(true);
    const modelled = await fetchLlmMatch(home, away, nextVariant);
    setLoading(false);
    setResult(modelled ?? simulateMatch(home, away));
    setAiModelled(modelled !== null);
    setMinute(0);
    setPlaying(true);
  }
  function kickOff() {
    void run(variant);
  }
  function replay() {
    const next = (variant + 1) % 100;
    setVariant(next);
    setBet(null);
    setSettled(null);
    void run(next);
  }
  function skipToEnd() {
    setPlaying(false);
    setMinute(90);
  }
  function placeBet() {
    if (!bettable || bet || result || stake <= 0 || stake > balance) return;
    setBalance(balance - stake);
    setBet({ pick, stake, odds: odds[pick] });
  }
  function settleBet() {
    if (!bet || !result || settled) return;
    const outcome: Pick =
      result.homeScore > result.awayScore ? "home" : result.awayScore > result.homeScore ? "away" : "draw";
    const won = outcome === bet.pick;
    const payout = won ? Math.round(bet.stake * bet.odds) : 0;
    if (won) setBalance(balance + payout);
    setSettled({ won, payout });
  }
  const pickLabel = (p: Pick) => (p === "home" ? home.code : p === "away" ? away.code : "Draw");

  const favPick = (["home", "draw", "away"] as Pick[]).reduce((best, p) => (odds[p] < odds[best] ? p : best), "home" as Pick);
  const jackAdvice = (() => {
    if (bet) {
      if (settled) {
        return settled.won
          ? `Get in! The ${pickLabel(bet.pick)} call lands +${settled.payout} OKB. Told you I knew this one.`
          : `Cruel game. The ${pickLabel(bet.pick)} bet didn't come off. We dust ourselves down and go again.`;
      }
      const lead: Pick = homeScore > awayScore ? "home" : awayScore > homeScore ? "away" : "draw";
      if (lead === bet.pick) return `Your ${pickLabel(bet.pick)} bet is sitting pretty at ${homeScore}-${awayScore}. Hold your nerve.`;
      return `It's ${homeScore}-${awayScore} — your ${pickLabel(bet.pick)} bet needs a swing. There's still time on the clock.`;
    }
    if (result) return `We're live, the book's shut. I'll tot up the slip on the final whistle.`;
    const tight = favPick !== "draw" && Math.abs(odds.home - odds.away) < 0.5;
    return tight
      ? `Tight line, this. ${pickLabel(favPick)} just edge it at ${odds[favPick].toFixed(2)}, but I wouldn't write off the draw.`
      : `My read: ${pickLabel(favPick)} at ${odds[favPick].toFixed(2)} is the value on the board. Stake what you're comfortable with.`;
  })();

  const coachAdvice = (() => {
    if (!coach) return "";
    const mine = coach.side === "home" ? homeScore : awayScore;
    const theirs = coach.side === "home" ? awayScore : homeScore;
    if (done) {
      if (mine > theirs) return `That's how we manage a game — composed and clinical. On to the next round.`;
      if (mine < theirs) return `Heads up. We lacked a cutting edge today. We regroup and go again.`;
      return `A draw keeps us in it. Not our finest, but we're still standing.`;
    }
    if (!result) return `Stick to the shape, win your duels, trust the plan. Kick us off when you're ready.`;
    if (minute < 20) return `Settle the nerves. Keep the ball, don't force the pass that isn't on.`;
    if (mine > theirs) return `${mine}-${theirs} up. Stay disciplined at the back, see this period out.`;
    if (mine < theirs) return `We're chasing it. Push the full-backs on, get crosses in — think about a change.`;
    return `All square. Lift the tempo and find a spark in the final third.`;
  })();

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

      {/* Gaffer's touchline advice */}
      {coach ? (
        <div className="border-b border-border p-4">
          <div className="flex items-start gap-2 rounded-xl border border-emerald-400/25 bg-emerald-500/[0.05] p-2.5">
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-mono text-[10px] font-semibold text-white">
              {coach.name.slice(0, 1)}
            </span>
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">{coach.name} · gaffer</span>
              <span className="mt-0.5 block text-[12px] leading-relaxed text-emerald-50">{coachAdvice}</span>
            </span>
          </div>
        </div>
      ) : null}

      {/* Bookie desk */}
      {bettable ? (
        <div className="border-b border-border p-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="flex items-center gap-2">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-violet-500 font-mono text-[10px] font-semibold text-white">J</span>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{"Jack's desk"}</span>
            </span>
            <span className="flex items-center gap-2">
              {onchainOkb !== null ? (
                <span className="font-mono text-[10px] text-emerald-300" title="Your real OKB on X Layer testnet">
                  {onchainOkb.toLocaleString(undefined, { maximumFractionDigits: 2 })} onchain
                </span>
              ) : null}
              <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-[11px] text-amber-300" suppressHydrationWarning>
                {balance} OKB
              </span>
            </span>
          </div>

          <div className="mb-3 flex items-start gap-2 rounded-xl border border-violet-400/25 bg-violet-500/[0.05] p-2.5">
            <span className="mt-0.5 size-1.5 shrink-0 rounded-full bg-violet-400" />
            <span className="text-[12px] leading-relaxed text-violet-100">{jackAdvice}</span>
          </div>

          {!bet ? (
            <>
              <div className="grid grid-cols-3 gap-1.5">
                {(["home", "draw", "away"] as Pick[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setPick(id)}
                    disabled={Boolean(result)}
                    className={cn(
                      "flex flex-col items-center rounded-xl border px-2 py-2 transition-colors disabled:opacity-50",
                      pick === id
                        ? "border-violet-400/50 bg-violet-500/[0.08]"
                        : id === favPick
                          ? "border-violet-400/30 hover:border-violet-400/50"
                          : "border-border hover:border-violet-400/30",
                    )}
                  >
                    <span className="text-[12px] text-foreground">{pickLabel(id)}</span>
                    <span className="font-mono text-[13px] font-semibold text-violet-300">{odds[id].toFixed(2)}</span>
                    {id === favPick ? (
                      <span className="mt-0.5 font-mono text-[8px] uppercase tracking-[0.12em] text-violet-300/80">{"Jack's tip"}</span>
                    ) : null}
                  </button>
                ))}
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  max={balance}
                  value={stake}
                  onChange={(e) => setStake(Math.max(1, Math.min(balance, Number(e.target.value))))}
                  disabled={Boolean(result)}
                  className="w-24 rounded-lg border border-border bg-background px-2 py-1.5 text-right font-mono text-sm text-foreground outline-none disabled:opacity-50"
                />
                <span className="font-mono text-[11px] text-muted-foreground">OKB</span>
                <Button variant="violet" size="sm" onClick={placeBet} disabled={Boolean(result) || stake <= 0 || stake > balance} className="ml-auto">
                  Place · win {Math.round(stake * odds[pick])}
                </Button>
              </div>
            </>
          ) : settled ? (
            <div
              className={cn(
                "flex items-center justify-between rounded-xl border p-3",
                settled.won ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-red-500/30 bg-red-500/[0.06]",
              )}
            >
              <span className={cn("font-mono text-[11px] uppercase tracking-[0.18em]", settled.won ? "text-emerald-300" : "text-red-300")}>
                {settled.won ? `Won +${settled.payout} OKB` : `Lost ${bet.stake} OKB`}
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {pickLabel(bet.pick)} @ {bet.odds.toFixed(2)}
              </span>
            </div>
          ) : done ? (
            <Button variant="violet" size="sm" onClick={settleBet} className="w-full">
              Settle bet · {pickLabel(bet.pick)} @ {bet.odds.toFixed(2)}
            </Button>
          ) : (
            <div className="flex items-center justify-between rounded-xl border border-violet-400/30 bg-violet-500/[0.05] p-3">
              <span className="font-mono text-[11px] text-violet-100">Live: {pickLabel(bet.pick)} · {bet.stake} OKB</span>
              <span className="font-mono text-[11px] text-muted-foreground">to win {Math.round(bet.stake * bet.odds)}</span>
            </div>
          )}
        </div>
      ) : null}

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-4">
        {!result ? (
          <Button variant="violet" size="sm" onClick={kickOff} disabled={loading}>
            <FootballIcon size={14} /> {loading ? "Modelling match…" : "Kick off"}
          </Button>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={() => setPlaying((p) => !p)} disabled={done || loading}>
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
            <Button variant="ghost" size="sm" onClick={skipToEnd} disabled={done || loading}>
              Skip to FT
            </Button>
            <Button variant="ghost" size="sm" onClick={replay} disabled={loading}>
              {loading ? "Modelling…" : done ? "Play again" : "Re-sim"}
            </Button>
          </>
        )}
      </div>

      {done && result ? <MatchReport result={result} /> : null}

      {/* Live commentary */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <span className="dot-live" style={{ position: "static" }} />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Live commentary
        </span>
        {aiModelled ? (
          <span className="ml-auto rounded-full border border-violet-400/30 bg-violet-500/[0.08] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-violet-200">
            AI-modelled
          </span>
        ) : null}
      </div>
      <div ref={feedRef} className="max-h-[20rem] overflow-y-auto scroll-smooth p-4">
        {!result ? (
          <p className="py-8 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            {loading ? "Modelling the match with AI…" : "Kick off to simulate the match"}
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {visibleComments.map((c, i) => (
              <CommentLine key={`${c.minute}-${i}`} comment={c} />
            ))}
          </div>
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

const TONE_TEXT: Record<SimComment["tone"], string> = {
  goal: "font-semibold text-foreground",
  card: "text-amber-300",
  chance: "text-sky-300/90",
  info: "text-violet-200",
  color: "italic text-muted-foreground",
};
const TONE_DOT: Record<SimComment["tone"], string> = {
  goal: "bg-violet-500",
  card: "bg-amber-400",
  chance: "bg-sky-400",
  info: "bg-emerald-400",
  color: "bg-foreground/30",
};

function MatchReport({ result }: { result: SimResult }) {
  const { stats, motm, home, away, events } = result;
  const yc = (side: "home" | "away") => events.filter((e) => e.type === "yellow" && e.side === side).length;
  const rows: [string, number, number][] = [
    ["Shots", stats.shotsHome, stats.shotsAway],
    ["On target", stats.sotHome, stats.sotAway],
    ["Corners", stats.cornersHome, stats.cornersAway],
    ["Fouls", stats.foulsHome, stats.foulsAway],
    ["Offsides", stats.offsidesHome, stats.offsidesAway],
    ["Yellow cards", yc("home"), yc("away")],
  ];
  return (
    <div className="border-b border-border p-4">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Match report</p>
      <div className="mb-3">
        <div className="mb-1 flex items-center justify-between font-mono text-[11px]">
          <span className="text-foreground">{stats.possessionHome}%</span>
          <span className="text-muted-foreground">Possession</span>
          <span className="text-foreground">{100 - stats.possessionHome}%</span>
        </div>
        <div className="flex h-2 overflow-hidden rounded-full bg-foreground/10">
          <div className="bg-violet-500" style={{ width: `${stats.possessionHome}%` }} />
          <div className="bg-zinc-500" style={{ width: `${100 - stats.possessionHome}%` }} />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        {rows.map(([label, h, a]) => (
          <div key={label} className="grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2">
            <span className="text-left font-mono text-[13px] tabular-nums text-foreground">{h}</span>
            <span className="text-center font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
            <span className="text-right font-mono text-[13px] tabular-nums text-foreground">{a}</span>
          </div>
        ))}
      </div>
      {motm ? (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/[0.05] p-2.5">
          <ChampionIcon size={14} className="text-amber-300" />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-300">MOTM</span>
          <span className="min-w-0 flex-1 truncate text-[13px] text-foreground">{motm.player}</span>
          <FlagOrb code={motm.side === "home" ? home.code : away.code} size={16} />
          <span className="font-mono text-[12px] font-semibold tabular-nums text-amber-300">{motm.rating.toFixed(1)}</span>
        </div>
      ) : null}
    </div>
  );
}

function CommentLine({ comment }: { comment: SimComment }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex items-start gap-2.5"
    >
      <span className="w-7 shrink-0 pt-0.5 text-right font-mono text-[10px] tabular-nums text-muted-foreground">
        {comment.minute > 0 ? `${comment.minute}'` : ""}
      </span>
      <span className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", TONE_DOT[comment.tone])} />
      <span className={cn("text-[13px] leading-relaxed", TONE_TEXT[comment.tone])}>{comment.text}</span>
    </motion.div>
  );
}
