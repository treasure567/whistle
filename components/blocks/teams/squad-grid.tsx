"use client";

import { motion } from "motion/react";

import { PlayerAvatar } from "@/components/ui/player-avatar";
import { GlowCard } from "@/components/ui/glow-card";
import type { Squad, SquadPlayer } from "@/types";

const POSITION_ORDER: ReadonlyArray<{ key: string; label: string }> = [
  { key: "Goalkeeper", label: "Goalkeepers" },
  { key: "Defender", label: "Defenders" },
  { key: "Midfielder", label: "Midfielders" },
  { key: "Attacker", label: "Attackers" },
];

function bucket(position: string | null): string {
  if (!position) return "Other";
  if (position.includes("Goalkeeper")) return "Goalkeeper";
  if (position.includes("Defender")) return "Defender";
  if (position.includes("Midfielder")) return "Midfielder";
  if (position.includes("Attacker") || position.includes("Forward")) return "Attacker";
  return "Other";
}

function group(players: ReadonlyArray<SquadPlayer>): Record<string, SquadPlayer[]> {
  const out: Record<string, SquadPlayer[]> = {};
  for (const p of players) {
    const key = bucket(p.position);
    if (!out[key]) out[key] = [];
    out[key].push(p);
  }
  for (const list of Object.values(out)) {
    list.sort((a, b) => (a.number ?? 999) - (b.number ?? 999));
  }
  return out;
}

function PlayerCard({ player, index }: { player: SquadPlayer; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.3 }}
    >
      <GlowCard padding="none" className="overflow-hidden">
        <div className="flex items-center gap-3 p-3">
          <PlayerAvatar src={player.photo} name={player.name} size={52} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] text-zinc-500">
                #{player.number ?? "—"}
              </span>
              <span className="truncate text-sm font-medium text-zinc-100">
                {player.name}
              </span>
            </div>
            <p className="mt-0.5 truncate text-[11px] text-zinc-500">
              {player.position ?? "—"}
              {player.age != null && ` · ${player.age}y`}
            </p>
          </div>
        </div>
      </GlowCard>
    </motion.div>
  );
}

interface SquadGridProps {
  squad: Squad;
}

export function SquadGrid({ squad }: SquadGridProps) {
  const grouped = group(squad.players);
  return (
    <div className="space-y-10">
      {POSITION_ORDER.map(({ key, label }) => {
        const list = grouped[key];
        if (!list || list.length === 0) return null;
        return (
          <section key={key} className="space-y-3">
            <div className="flex items-baseline gap-3">
              <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-violet-300">
                {label}
              </h2>
              <span className="font-mono text-xs text-zinc-600">{list.length}</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p, i) => (
                <PlayerCard key={p.id} player={p} index={i} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
