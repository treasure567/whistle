"use client";

import { useMemo, useState } from "react";
import { ArrowDataTransferHorizontalIcon, DiceIcon } from "hugeicons-react";

import { Button } from "@/components/ui/button";
import { FlagOrb } from "@/components/ui/flag-orb";
import { MatchSim } from "./match-sim";
import { TournamentSim } from "./tournament-sim";
import { useSimBackground } from "@/components/providers/sim-background";
import type { SimTeam } from "@/lib/sim/engine";
import { cn } from "@/lib/utils";

export function SimulateView({ teams }: { teams: SimTeam[] }) {
  const byCode = useMemo(() => new Map(teams.map((t) => [t.code, t])), [teams]);
  const { start: startBackground, matches: bgMatches } = useSimBackground();
  const [homeCode, setHomeCode] = useState(teams[0]?.code ?? "");
  const [awayCode, setAwayCode] = useState(teams[1]?.code ?? "");
  const [mode, setMode] = useState<"single" | "tournament">("single");

  const home = byCode.get(homeCode);
  const away = byCode.get(awayCode);

  const bgAtCap = bgMatches.length >= 4;
  const bgRunning = bgMatches.some((m) => m.home.code === homeCode && m.away.code === awayCode && m.minute < 90);
  const bgDisabled = bgAtCap || bgRunning;
  const bgLabel = bgAtCap ? "Background full" : bgRunning ? "Already running" : "Run in background";

  function random() {
    if (teams.length < 2) return;
    const a = Math.floor(Math.random() * teams.length);
    let b = Math.floor(Math.random() * teams.length);
    while (b === a) b = Math.floor(Math.random() * teams.length);
    setHomeCode(teams[a]!.code);
    setAwayCode(teams[b]!.code);
  }
  function swap() {
    setHomeCode(awayCode);
    setAwayCode(homeCode);
  }

  if (teams.length < 2 || !home || !away) {
    return (
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Squad data could not be loaded. Start the backend and seed players, then refresh.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10">
      <div className="mb-6 flex flex-wrap gap-1.5">
        <button type="button" onClick={() => setMode("single")} className={modeChip(mode === "single")}>
          Single match
        </button>
        <button type="button" onClick={() => setMode("tournament")} className={modeChip(mode === "tournament")}>
          Full tournament
        </button>
      </div>
      {mode === "tournament" ? (
        <TournamentSim teams={teams} />
      ) : (
        <div className="grid items-start gap-6 md:grid-cols-[1fr_1.4fr]">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Choose the tie</p>
        <TeamSelect label="Home" value={homeCode} exclude={awayCode} teams={teams} onChange={setHomeCode} />
        <div className="flex items-center justify-center">
          <button
            type="button"
            onClick={swap}
            aria-label="Swap teams"
            className="inline-flex size-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowDataTransferHorizontalIcon size={14} />
          </button>
        </div>
        <TeamSelect label="Away" value={awayCode} exclude={homeCode} teams={teams} onChange={setAwayCode} />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={random} className="flex-1">
            <DiceIcon size={14} /> Random tie
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => startBackground(home, away)}
            disabled={bgDisabled}
            className="flex-1"
          >
            {bgLabel}
          </Button>
        </div>
        <div className="mt-1 grid grid-cols-2 gap-3 border-t border-border pt-4">
          <StrengthBar team={home} />
          <StrengthBar team={away} align="end" />
        </div>
      </div>

      <MatchSim key={`${homeCode}-${awayCode}`} home={home} away={away} bettable />
        </div>
      )}
    </div>
  );
}

function modeChip(active: boolean): string {
  return cn(
    "rounded-full border px-4 py-1.5 text-[12px] transition-colors",
    active
      ? "border-violet-400/50 bg-violet-500/[0.1] text-violet-100"
      : "border-border text-muted-foreground hover:border-violet-400/30 hover:text-foreground",
  );
}

function TeamSelect({
  label,
  value,
  exclude,
  teams,
  onChange,
}: {
  label: string;
  value: string;
  exclude: string;
  teams: SimTeam[];
  onChange: (code: string) => void;
}) {
  const current = teams.find((t) => t.code === value);
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-foreground/[0.02] px-3 py-2">
        {current ? <FlagOrb code={current.code} size={26} /> : null}
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-transparent text-sm text-foreground outline-none"
        >
          {teams.map((t) => (
            <option key={t.code} value={t.code} disabled={t.code === exclude} className="bg-background text-foreground">
              {t.name}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function StrengthBar({ team, align = "start" }: { team: SimTeam; align?: "start" | "end" }) {
  return (
    <div className={cn(align === "end" && "text-right")}>
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{team.code} rating</p>
      <div className={cn("mt-1.5 h-1.5 overflow-hidden rounded-full bg-foreground/[0.08]", align === "end" && "[direction:rtl]")}>
        <div className="h-full rounded-full bg-violet-500" style={{ width: `${Math.round(team.strength * 100)}%` }} />
      </div>
    </div>
  );
}
