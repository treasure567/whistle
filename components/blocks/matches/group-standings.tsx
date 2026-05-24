"use client";

import Link from "next/link";

import { GlowCard } from "@/components/ui/glow-card";
import { FlagOrb } from "@/components/ui/flag-orb";
import { GROUPS } from "@/lib/mock/groups";
import { SQUADS } from "@/lib/mock/squads";
import type { GroupStanding } from "@/types";
import { cn } from "@/lib/utils";

function sortStandings(teams: ReadonlyArray<GroupStanding>): GroupStanding[] {
  return [...teams].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const gdA = a.gf - a.ga;
    const gdB = b.gf - b.ga;
    if (gdB !== gdA) return gdB - gdA;
    return b.gf - a.gf;
  });
}

function GroupCard({
  letter,
  teams,
}: {
  letter: string;
  teams: ReadonlyArray<GroupStanding>;
}) {
  const sorted = sortStandings(teams);
  return (
    <GlowCard padding="none">
      <div className="border-b border-white/10 px-4 py-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
          Group {letter}
        </span>
      </div>
      <table className="w-full">
        <thead>
          <tr className="font-mono text-[9px] uppercase tracking-[0.18em] text-zinc-500">
            <th className="px-3 py-2 text-left font-normal">Team</th>
            <th className="px-1 py-2 text-right font-normal tabular-nums">P</th>
            <th className="px-1 py-2 text-right font-normal tabular-nums">W</th>
            <th className="px-1 py-2 text-right font-normal tabular-nums">D</th>
            <th className="px-1 py-2 text-right font-normal tabular-nums">L</th>
            <th className="px-1 py-2 text-right font-normal tabular-nums">GD</th>
            <th className="px-3 py-2 text-right font-normal tabular-nums">Pts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {sorted.map((row, idx) => {
            const name = SQUADS[row.code]?.country ?? row.code;
            const advancing = idx < 2;
            const gd = row.gf - row.ga;
            return (
              <tr
                key={row.code}
                className={cn(
                  "text-[12px] transition-colors hover:bg-white/[0.04]",
                  advancing ? "text-zinc-100" : "text-zinc-400",
                )}
              >
                <td className="px-3 py-2">
                  <Link
                    href={`/teams/${row.code}`}
                    className="flex items-center gap-2 hover:text-violet-200"
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        advancing ? "bg-emerald-400" : "bg-zinc-700",
                      )}
                      aria-hidden
                    />
                    <FlagOrb code={row.code} size={18} />
                    <span className="truncate">{name}</span>
                  </Link>
                </td>
                <td className="px-1 py-2 text-right tabular-nums">{row.played}</td>
                <td className="px-1 py-2 text-right tabular-nums">{row.won}</td>
                <td className="px-1 py-2 text-right tabular-nums">{row.drawn}</td>
                <td className="px-1 py-2 text-right tabular-nums">{row.lost}</td>
                <td className="px-1 py-2 text-right tabular-nums">
                  {gd > 0 ? `+${gd}` : gd}
                </td>
                <td className="px-3 py-2 text-right font-mono font-semibold tabular-nums text-zinc-100">
                  {row.points}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </GlowCard>
  );
}

export function GroupStandings() {
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10">
      <div className="mb-6 flex items-baseline gap-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-violet-300">
          Group stage
        </h2>
        <span className="font-mono text-xs text-zinc-600">12 groups · top 2 advance</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {GROUPS.map((g) => (
          <GroupCard key={g.letter} letter={g.letter} teams={g.teams} />
        ))}
      </div>
    </div>
  );
}
