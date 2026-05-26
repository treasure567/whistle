"use client";

import { useMemo, useState } from "react";
import { ArrowLeft01Icon, FootballIcon } from "hugeicons-react";

import { Button } from "@/components/ui/button";
import { CountryPicker } from "@/components/ui/country-picker";
import { FlagOrb } from "@/components/ui/flag-orb";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { FlatPitch } from "@/components/blocks/manager/flat-pitch";
import { MatchSim } from "@/components/blocks/simulate/match-sim";
import { PenaltyShootout, type ShootoutResult } from "@/components/blocks/simulate/penalty-shootout";
import { fetchManagerBrief } from "@/lib/api/manager";
import type { ManagerBriefResult } from "@/lib/api/schemas";
import type { SimTeam } from "@/lib/sim/engine";
import { cn } from "@/lib/utils";

export type ManagerPlayer = { id: string; name: string; position: string; price: number; photo?: string | null };
export type ManagerTeam = { code: string; name: string; players: ManagerPlayer[] };

const FORMATIONS: Record<string, { DEF: number; MID: number; FWD: number }> = {
  "4-4-2": { DEF: 4, MID: 4, FWD: 2 },
  "4-3-3": { DEF: 4, MID: 3, FWD: 3 },
  "3-5-2": { DEF: 3, MID: 5, FWD: 2 },
  "5-3-2": { DEF: 5, MID: 3, FWD: 2 },
  "4-5-1": { DEF: 4, MID: 5, FWD: 1 },
};
const FORMATION_KEYS = Object.keys(FORMATIONS);

const DIFFICULTY = [
  { id: "easy", label: "Easy", factor: 0.82 },
  { id: "normal", label: "Normal", factor: 1.0 },
  { id: "hard", label: "Hard", factor: 1.18 },
] as const;
type Difficulty = (typeof DIFFICULTY)[number]["id"];

const SCORE_ORDER = ["FWD", "MID", "DEF", "GK"];
const ROUNDS = ["Round of 16", "Quarter-final", "Semi-final", "Final"] as const;

function bestXI(players: ManagerPlayer[], formation: string): ManagerPlayer[] {
  const shape = FORMATIONS[formation]!;
  const pick = (pos: string, n: number) =>
    players.filter((p) => p.position === pos).sort((a, b) => b.price - a.price).slice(0, n);
  return [...pick("GK", 1), ...pick("DEF", shape.DEF), ...pick("MID", shape.MID), ...pick("FWD", shape.FWD)];
}

function strengthFromXI(xi: ManagerPlayer[]): number {
  if (xi.length === 0) return 0.5;
  const avg = xi.reduce((s, p) => s + p.price, 0) / xi.length;
  return Math.max(0.4, Math.min(0.95, avg / 12));
}

function scorerOrder(xi: ManagerPlayer[]): string[] {
  return [...xi]
    .sort((a, b) => SCORE_ORDER.indexOf(a.position) - SCORE_ORDER.indexOf(b.position))
    .map((p) => p.name);
}

export function ManagerMode({ teams }: { teams: ManagerTeam[] }) {
  const byCode = useMemo(() => new Map(teams.map((t) => [t.code, t])), [teams]);
  const [phase, setPhase] = useState<"setup" | "squad" | "match">("setup");
  const [country, setCountry] = useState(teams[0]?.code ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>("normal");
  const [formation, setFormation] = useState("4-3-3");
  const [xi, setXi] = useState<ManagerPlayer[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [opponent, setOpponent] = useState<string>("");
  const [round, setRound] = useState(0);
  const [outcome, setOutcome] = useState<null | "advanced" | "eliminated" | "champion">(null);
  const [lastScore, setLastScore] = useState<{ h: number; a: number } | null>(null);
  const [brief, setBrief] = useState<ManagerBriefResult | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);
  const [analysis, setAnalysis] = useState<ManagerBriefResult | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [shootout, setShootout] = useState(false);
  const [pens, setPens] = useState<{ h: number; a: number } | null>(null);

  const squad = useMemo(() => byCode.get(country)?.players ?? [], [byCode, country]);
  const bench = useMemo(() => {
    const ids = new Set(xi.map((p) => p.id));
    return squad.filter((p) => !ids.has(p.id));
  }, [squad, xi]);

  function pickOpponent() {
    const others = teams.filter((t) => t.code !== country);
    const opp = others[Math.floor(Math.random() * others.length)];
    if (opp) setOpponent(opp.code);
  }

  function startSquad() {
    setXi(bestXI(squad, formation));
    setActiveId(null);
    setBrief(null);
    setAnalysis(null);
    setRound(0);
    pickOpponent();
    setPhase("squad");
  }

  function changeFormation(f: string) {
    setFormation(f);
    setXi(bestXI(squad, f));
    setActiveId(null);
  }

  function swapIn(benchPlayer: ManagerPlayer) {
    const active = xi.find((p) => p.id === activeId);
    if (!active || active.position !== benchPlayer.position) return;
    setXi((prev) => prev.map((p) => (p.id === active.id ? benchPlayer : p)));
    setActiveId(null);
  }

  function kickOff() {
    setOutcome(null);
    setLastScore(null);
    setAnalysis(null);
    setShootout(false);
    setPens(null);
    setPhase("match");
  }

  function advanceRound() {
    const others = teams.filter((t) => t.code !== country && t.code !== opponent);
    const opp = others[Math.floor(Math.random() * others.length)];
    if (opp) setOpponent(opp.code);
    setRound((r) => r + 1);
    setOutcome(null);
    setLastScore(null);
    setBrief(null);
    setAnalysis(null);
    setShootout(false);
    setPens(null);
    setPhase("squad");
  }

  function restartRun() {
    setRound(0);
    setOutcome(null);
    setLastScore(null);
    setBrief(null);
    setAnalysis(null);
    setShootout(false);
    setPens(null);
    pickOpponent();
    setPhase("squad");
  }

  const diff = DIFFICULTY.find((d) => d.id === difficulty)!;
  const oppTeam = byCode.get(opponent);
  const homeSim: SimTeam | null = byCode.get(country)
    ? { name: byCode.get(country)!.name, code: country, strength: strengthFromXI(xi), players: scorerOrder(xi) }
    : null;
  const awaySim: SimTeam | null = oppTeam
    ? (() => {
        const oppXi = bestXI(oppTeam.players, "4-3-3");
        return {
          name: oppTeam.name,
          code: oppTeam.code,
          strength: Math.max(0.4, Math.min(0.98, strengthFromXI(oppXi) * (diff.factor + round * 0.05))),
          players: scorerOrder(oppXi),
        };
      })()
    : null;
  function resolveOutcome(through: boolean) {
    if (!through) setOutcome("eliminated");
    else if (round >= ROUNDS.length - 1) setOutcome("champion");
    else setOutcome("advanced");
  }

  function handleResult({ homeScore, awayScore }: { homeScore: number; awayScore: number }) {
    setLastScore({ h: homeScore, a: awayScore });
    setPens(null);
    if (homeScore === awayScore) {
      setShootout(true); // knockout tie: extra time, then penalties
      return;
    }
    resolveOutcome(homeScore > awayScore);
  }

  function onShootoutResult(result: ShootoutResult) {
    setShootout(false);
    setPens({ h: result.homePens, a: result.awayPens });
    resolveOutcome(result.homeWon);
  }

  const homeBench = bench.map((p) => p.name);
  const awayBench = oppTeam
    ? (() => {
        const oppXi = bestXI(oppTeam.players, "4-3-3");
        const xiIds = new Set(oppXi.map((p) => p.id));
        return oppTeam.players.filter((p) => !xiIds.has(p.id)).map((p) => p.name);
      })()
    : [];

  async function askTom() {
    if (!homeSim || !awaySim || briefLoading) return;
    setBriefLoading(true);
    try {
      const result = await fetchManagerBrief({
        countryName: homeSim.name,
        opponentName: awaySim.name,
        formation,
        ourStrength: homeSim.strength,
        theirStrength: awaySim.strength,
        xi: xi.map((p) => ({ name: p.name, position: p.position, price: p.price })),
        bench: bench.map((p) => ({ name: p.name, position: p.position, price: p.price })),
      });
      setBrief(result);
    } catch {
      setBrief(null);
    } finally {
      setBriefLoading(false);
    }
  }

  async function askTomAnalysis() {
    if (!homeSim || !awaySim || !lastScore || analysisLoading) return;
    setAnalysisLoading(true);
    try {
      const result = await fetchManagerBrief({
        countryName: homeSim.name,
        opponentName: awaySim.name,
        formation,
        ourStrength: homeSim.strength,
        theirStrength: awaySim.strength,
        xi: xi.map((p) => ({ name: p.name, position: p.position, price: p.price })),
        bench: bench.map((p) => ({ name: p.name, position: p.position, price: p.price })),
        played: { ourScore: lastScore.h, theirScore: lastScore.a },
      });
      setAnalysis(result);
    } catch {
      setAnalysis(null);
    } finally {
      setAnalysisLoading(false);
    }
  }

  if (teams.length < 2) {
    return (
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Squad data could not be loaded. Start the backend and seed players, then refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 md:px-10">
      {phase === "setup" ? (
        <div className="mx-auto max-w-xl rounded-3xl border border-border bg-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
            Take charge
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Pick your nation</h2>
          <div className="mt-5">
            <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Country
            </span>
            <CountryPicker
              value={country}
              options={teams.map((t) => ({ code: t.code, name: t.name }))}
              onChange={setCountry}
            />
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Difficulty
            </label>
            <div className="flex gap-1.5">
              {DIFFICULTY.map((d) => (
                <Chip key={d.id} active={difficulty === d.id} onClick={() => setDifficulty(d.id)} label={d.label} />
              ))}
            </div>
          </div>
          <Button variant="violet" size="lg" onClick={startSquad} className="mt-6 w-full">
            Enter the dugout
          </Button>
        </div>
      ) : phase === "squad" ? (
        <div className="flex flex-col gap-6">
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-emerald-500 font-mono text-[11px] font-semibold text-white">
                  T
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{"Tom's briefing"}</span>
              </span>
              {brief ? (
                <span className="rounded-full border border-emerald-400/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">
                  {brief.verdict}
                </span>
              ) : null}
            </div>
            {awaySim ? (
              <div className="mb-3 flex items-center gap-3 rounded-xl border border-border bg-foreground/[0.02] p-3">
                <FlagOrb code={awaySim.code} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">Next up: {awaySim.name}</p>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-foreground/[0.08]">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${Math.round(awaySim.strength * 100)}%` }} />
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">threat</span>
              </div>
            ) : null}
            {brief ? (
              <>
                <p className="mb-2 text-[13px] leading-relaxed text-foreground">{brief.opponentRead}</p>
                <ul className="flex flex-col gap-1.5">
                  {brief.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-muted-foreground">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-[13px] text-muted-foreground">
                Ask Tom to scout {awaySim?.name ?? "the opponent"} and suggest tweaks before kickoff.
              </p>
            )}
            <Button variant="outline" size="sm" onClick={askTom} disabled={briefLoading} className="mt-3">
              {briefLoading ? "Tom's watching tape…" : brief ? "Refresh read" : "Ask Tom for his read"}
            </Button>
          </div>
          <div className="grid items-start gap-6 md:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <FlagOrb code={country} size={34} />
              <div>
                <p className="text-sm font-semibold text-foreground">{byCode.get(country)?.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Manager · {difficulty} · {ROUNDS[round]}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {FORMATION_KEYS.map((f) => (
                <Chip key={f} active={formation === f} onClick={() => changeFormation(f)} label={f} />
              ))}
            </div>
            <FlatPitch players={xi} activeId={activeId} onSelect={(p) => setActiveId(p.id)} />
            <p className="text-[11px] text-muted-foreground">
              Tap a player on the pitch, then tap a sub of the same position to swap.
            </p>
            <Button variant="violet" size="lg" onClick={kickOff}>
              <FootballIcon size={14} /> Play your match
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-card p-4">
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Bench · tap to sub in
            </p>
            <div className="flex max-h-[26rem] flex-col gap-1.5 overflow-y-auto">
              {bench.map((p) => {
                const active = xi.find((s) => s.id === activeId);
                const swappable = active && active.position === p.position;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => swapIn(p)}
                    disabled={!swappable}
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-3 py-2 text-left transition-colors",
                      swappable
                        ? "border-violet-400/40 bg-violet-500/[0.06] hover:bg-violet-500/[0.12]"
                        : "border-border opacity-60",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <PlayerAvatar src={p.photo ?? undefined} name={p.name} size={30} />
                      <span className="min-w-0">
                        <span className="block truncate text-[13px] text-foreground">{p.name}</span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                          {p.position}
                        </span>
                      </span>
                    </span>
                    <span className="font-mono text-[12px] tabular-nums text-violet-500 dark:text-violet-300">{p.price.toFixed(1)}</span>
                  </button>
                );
              })}
            </div>
          </div>
          </div>
        </div>
      ) : homeSim && awaySim ? (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setPhase("squad")}
            className="inline-flex w-fit items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft01Icon size={13} /> Back to squad
          </button>
          <div className="rounded-2xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-center gap-1.5">
              {ROUNDS.map((r, i) => (
                <span
                  key={r}
                  title={r}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    i < round ? "bg-emerald-500" : i === round ? "bg-violet-500" : "bg-foreground/15",
                  )}
                />
              ))}
            </div>
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="text-foreground">{homeSim.name}</span>
              <span>vs</span>
              <span className="text-foreground">{awaySim.name}</span>
              <span className="rounded-full border border-violet-400/40 px-2 py-0.5 text-violet-500 dark:text-violet-200">{ROUNDS[round]}</span>
              <span className="rounded-full border border-border px-2 py-0.5">{difficulty}</span>
            </div>
          </div>
          <MatchSim
            key={`${country}-${opponent}-${round}`}
            home={homeSim}
            away={awaySim}
            coach={{ name: "Tom", side: "home" }}
            bench={{ home: homeBench, away: awayBench }}
            onResult={handleResult}
          />
          {shootout ? (
            <PenaltyShootout
              homeCode={homeSim.code}
              awayCode={awaySim.code}
              homeStrength={homeSim.strength}
              awayStrength={awaySim.strength}
              onResult={onShootoutResult}
            />
          ) : null}
          {outcome ? (
            <div
              className={cn(
                "rounded-2xl border p-5 text-center",
                outcome === "eliminated"
                  ? "border-red-500/30 bg-red-500/[0.06]"
                  : "border-emerald-500/30 bg-emerald-500/[0.06]",
              )}
            >
              {lastScore ? (
                <p className="mb-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
                  {lastScore.h}-{lastScore.a}
                </p>
              ) : null}
              {pens ? (
                <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">
                  {outcome === "eliminated" ? "Lost" : "Won"} {pens.h}-{pens.a} on penalties
                </p>
              ) : null}
              {outcome === "champion" ? (
                <>
                  <p className="text-lg font-semibold text-foreground">World Champions!</p>
                  <p className="mt-1 text-sm text-muted-foreground">{homeSim.name} have won the tournament. Some run, gaffer.</p>
                </>
              ) : outcome === "eliminated" ? (
                <>
                  <p className="text-lg font-semibold text-foreground">Knocked out in the {ROUNDS[round]}</p>
                  <p className="mt-1 text-sm text-muted-foreground">Heartbreak. Reshape the squad and go again.</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-semibold text-foreground">Through to the {ROUNDS[round + 1]}!</p>
                  <p className="mt-1 text-sm text-muted-foreground">{homeSim.name} march on. Scout the next opponent before you play.</p>
                </>
              )}

              {analysis ? (
                <div className="mt-4 rounded-xl border border-emerald-400/25 bg-emerald-500/[0.05] p-3 text-left">
                  <div className="mb-1.5 flex items-center gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 font-mono text-[10px] font-semibold text-white">
                      T
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">
                      {"Tom's analysis"}
                    </span>
                    <span className="ml-auto rounded-full border border-emerald-400/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">
                      {analysis.verdict}
                    </span>
                  </div>
                  <p className="mb-2 text-[13px] leading-relaxed text-foreground">{analysis.opponentRead}</p>
                  <ul className="flex flex-col gap-1.5">
                    {analysis.suggestions.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-[13px] leading-relaxed text-muted-foreground">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-emerald-400" />
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <Button variant="outline" size="sm" onClick={askTomAnalysis} disabled={analysisLoading}>
                  {analysisLoading ? "Tom's reviewing the tape…" : analysis ? "Refresh analysis" : "Ask Tom for his analysis"}
                </Button>
                {outcome === "advanced" ? (
                  <Button variant="violet" size="sm" onClick={advanceRound}>
                    <FootballIcon size={14} /> Prepare for the {ROUNDS[round + 1]}
                  </Button>
                ) : (
                  <Button variant="violet" size="sm" onClick={restartRun}>
                    {outcome === "champion" ? "Start a new run" : "Try again"}
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[12px] transition-colors",
        active
          ? "border-violet-400/50 bg-violet-500/[0.08] text-violet-700 dark:text-violet-100"
          : "border-border text-muted-foreground hover:border-violet-400/30 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
