"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ChampionIcon, DiceIcon } from "hugeicons-react";

import { Button } from "@/components/ui/button";
import { FlagOrb } from "@/components/ui/flag-orb";
import { simulateTournament, type KnockoutTie, type Group, type Tournament } from "@/lib/sim/tournament";
import type { SimTeam } from "@/lib/sim/engine";
import { cn } from "@/lib/utils";

export function TournamentSim({ teams }: { teams: SimTeam[] }) {
  const [result, setResult] = useState<Tournament | null>(null);

  function run() {
    setResult(simulateTournament(teams));
  }

  if (teams.length < 8) {
    return (
      <p className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
        Not enough teams to run a tournament. Seed the player pool and refresh.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-5">
        <div>
          <p className="text-sm font-semibold text-foreground">Run the whole World Cup</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            Random draw, group stage, then knockouts all the way to the final.
          </p>
        </div>
        <Button variant="violet" size="sm" onClick={run}>
          <DiceIcon size={14} /> {result ? "Re-draw & re-sim" : "Simulate tournament"}
        </Button>
      </div>

      {result ? (
        <>
          {result.champion ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/[0.08] to-transparent p-5"
            >
              <ChampionIcon size={26} className="text-amber-300" />
              <FlagOrb code={result.champion.code} size={44} />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300">Champions</p>
                <p className="text-xl font-semibold tracking-tight text-foreground">{result.champion.name}</p>
              </div>
            </motion.div>
          ) : null}

          {/* Knockouts */}
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
              Knockout bracket
            </p>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {result.rounds.map((round) => (
                <div key={round.name} className="w-56 shrink-0">
                  <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    {round.name}
                  </p>
                  <div className="flex flex-col gap-2">
                    {round.ties.map((tie, i) => (
                      <TieCard key={i} tie={tie} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Groups */}
          <div>
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
              Group stage
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {result.groups.map((group) => (
                <GroupTable key={group.name} group={group} qualified={result.qualified} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="rounded-2xl border border-border bg-card p-10 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
          Hit simulate to draw the groups and play it out
        </p>
      )}
    </div>
  );
}

function TieCard({ tie }: { tie: KnockoutTie }) {
  if (!tie.home || !tie.away) return null;
  const homeWon = tie.winner?.code === tie.home.code;
  return (
    <div className="rounded-xl border border-border bg-card p-2.5">
      <Row code={tie.home.code} name={tie.home.code} score={tie.homeScore} won={homeWon} />
      <Row code={tie.away.code} name={tie.away.code} score={tie.awayScore} won={!homeWon} />
      {tie.pens ? <p className="mt-1 text-right font-mono text-[9px] uppercase tracking-[0.16em] text-amber-300">on pens</p> : null}
    </div>
  );
}

function Row({ code, name, score, won }: { code: string; name: string; score: number; won: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 py-0.5", won ? "text-foreground" : "text-muted-foreground")}>
      <FlagOrb code={code} size={18} />
      <span className={cn("flex-1 truncate font-mono text-[12px]", won && "font-semibold")}>{name}</span>
      <span className="font-mono text-[12px] tabular-nums">{score}</span>
    </div>
  );
}

function GroupTable({ group, qualified }: { group: Group; qualified: string[] }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-3">
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Group {group.name}</p>
      <div className="flex flex-col gap-0.5">
        {group.rows.map((r) => {
          const through = qualified.includes(r.team.code);
          return (
            <div key={r.team.code} className="flex items-center gap-2 py-1">
              <span className={cn("size-1.5 rounded-full", through ? "bg-emerald-400" : "bg-transparent")} />
              <FlagOrb code={r.team.code} size={16} />
              <span className={cn("flex-1 truncate font-mono text-[11px]", through ? "text-foreground" : "text-muted-foreground")}>
                {r.team.code}
              </span>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{r.gd > 0 ? `+${r.gd}` : r.gd}</span>
              <span className="w-5 text-right font-mono text-[11px] font-semibold tabular-nums text-foreground">{r.pts}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
