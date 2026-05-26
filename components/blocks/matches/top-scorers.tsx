"use client";

import Link from "next/link";

import { GlowCard } from "@/components/ui/glow-card";
import { PlayerAvatar } from "@/components/ui/player-avatar";
import { FlagOrb } from "@/components/ui/flag-orb";
import { TOP_SCORERS } from "@/lib/mock/top-scorers";

export function TopScorers() {
  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10">
      <div className="mb-6 flex items-baseline gap-3">
        <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
          Golden Boot race
        </h2>
        <span className="font-mono text-xs text-muted-foreground">tournament top scorers</span>
      </div>
      <GlowCard padding="none">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              <th className="px-4 py-3 text-left font-normal">#</th>
              <th className="px-2 py-3 text-left font-normal">Player</th>
              <th className="px-2 py-3 text-left font-normal">Country</th>
              <th className="px-2 py-3 text-right font-normal tabular-nums">Goals</th>
              <th className="hidden px-2 py-3 text-right font-normal tabular-nums sm:table-cell">
                Assists
              </th>
              <th className="hidden px-4 py-3 text-right font-normal tabular-nums sm:table-cell">
                Matches
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {TOP_SCORERS.map((p) => (
              <tr key={p.playerId} className="text-sm transition-colors hover:bg-foreground/[0.03]">
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground tabular-nums">
                  {p.rank}
                </td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-3">
                    <PlayerAvatar src={p.photo} name={p.name} size={36} />
                    <span className="text-foreground">{p.name}</span>
                  </div>
                </td>
                <td className="px-2 py-3">
                  <Link
                    href={`/teams/${p.country}`}
                    className="flex items-center gap-2 text-muted-foreground hover:text-violet-500 dark:hover:text-violet-300"
                  >
                    <FlagOrb code={p.country} size={20} />
                    <span className="font-mono text-[11px]">{p.country}</span>
                  </Link>
                </td>
                <td className="px-2 py-3 text-right font-mono font-semibold tabular-nums text-foreground">
                  {p.goals}
                </td>
                <td className="hidden px-2 py-3 text-right font-mono tabular-nums text-muted-foreground sm:table-cell">
                  {p.assists}
                </td>
                <td className="hidden px-4 py-3 text-right font-mono tabular-nums text-muted-foreground sm:table-cell">
                  {p.matches}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlowCard>
    </div>
  );
}
