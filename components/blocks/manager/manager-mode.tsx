"use client";

import { useMemo, useState } from "react";
import { ArrowLeft01Icon, FootballIcon } from "hugeicons-react";

import { Button } from "@/components/ui/button";
import { FlagOrb } from "@/components/ui/flag-orb";
import { FlatPitch } from "@/components/blocks/manager/flat-pitch";
import { MatchSim } from "@/components/blocks/simulate/match-sim";
import type { SimTeam } from "@/lib/sim/engine";
import { cn } from "@/lib/utils";

export type ManagerPlayer = { id: string; name: string; position: string; price: number };
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

  const squad = useMemo(() => byCode.get(country)?.players ?? [], [byCode, country]);
  const bench = useMemo(() => {
    const ids = new Set(xi.map((p) => p.id));
    return squad.filter((p) => !ids.has(p.id));
  }, [squad, xi]);

  function startSquad() {
    setXi(bestXI(squad, formation));
    setActiveId(null);
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
    const others = teams.filter((t) => t.code !== country);
    const opp = others[Math.floor(Math.random() * others.length)];
    if (opp) setOpponent(opp.code);
    setPhase("match");
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
          strength: Math.max(0.4, Math.min(0.98, strengthFromXI(oppXi) * diff.factor)),
          players: scorerOrder(oppXi),
        };
      })()
    : null;

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
            <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Country
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-foreground/[0.02] px-3 py-2">
              <FlagOrb code={country} size={28} />
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground outline-none"
              >
                {teams.map((t) => (
                  <option key={t.code} value={t.code} className="bg-background text-foreground">
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
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
        <div className="grid items-start gap-6 md:grid-cols-[1fr_1fr]">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <FlagOrb code={country} size={34} />
              <div>
                <p className="text-sm font-semibold text-foreground">{byCode.get(country)?.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Manager · {difficulty}
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
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] text-foreground">{p.name}</span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        {p.position}
                      </span>
                    </span>
                    <span className="font-mono text-[12px] tabular-nums text-violet-300">{p.price.toFixed(1)}</span>
                  </button>
                );
              })}
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
            <div className="flex items-center justify-center gap-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              <span className="text-foreground">{homeSim.name}</span>
              <span>vs</span>
              <span className="text-foreground">{awaySim.name}</span>
              <span className="rounded-full border border-border px-2 py-0.5">{difficulty}</span>
            </div>
          </div>
          <MatchSim key={`${country}-${opponent}`} home={homeSim} away={awaySim} />
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
          ? "border-violet-400/50 bg-violet-500/[0.08] text-violet-100"
          : "border-border text-muted-foreground hover:border-violet-400/30 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
