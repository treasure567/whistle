"use client";

import { CrownIcon } from "hugeicons-react";

import { PlayerAvatar } from "@/components/ui/player-avatar";
import type { Position, SquadSlot } from "@/lib/fantasy";
import { cn } from "@/lib/utils";

const ROW_ORDER: ReadonlyArray<{ pos: Position; label: string }> = [
  { pos: "FWD", label: "forwards" },
  { pos: "MID", label: "midfield" },
  { pos: "DEF", label: "defence" },
  { pos: "GK", label: "keeper" },
];

function shortName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return name;
  return `${parts[0]![0]}. ${parts[parts.length - 1]}`;
}

export function PitchView({
  slots,
  onSetCaptain,
}: {
  slots: SquadSlot[];
  onSetCaptain: (id: string) => void;
}) {
  const starters = slots.filter((slot) => slot.starter);

  return (
    <div className="mx-auto mb-6 max-w-7xl px-6 md:px-10">
      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-emerald-900/50 via-emerald-800/35 to-emerald-900/55 shadow-2xl shadow-emerald-950/30">
        <Markings />
        <div className="absolute left-4 top-3 z-20 font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-200/80">
          Your starting XI
        </div>
        <div className="absolute right-4 top-3 z-20 rounded-full border border-white/15 bg-black/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-100">
          {starters.length}/11
        </div>
        <div className="relative z-10 flex aspect-[16/12] flex-col justify-evenly gap-1 px-2 py-8 sm:aspect-[16/10] sm:px-6">
          {ROW_ORDER.map(({ pos, label }) => {
            const players = starters.filter((slot) => slot.player.position === pos);
            return (
              <div key={pos} className="flex items-center justify-evenly gap-1">
                {players.length === 0 ? (
                  <span className="flex h-[42px] items-center justify-center rounded-full border border-dashed border-white/25 px-4 font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                    Add your {label}
                  </span>
                ) : (
                  players.map((slot) => (
                    <Token key={slot.player.id} slot={slot} onSetCaptain={() => onSetCaptain(slot.player.id)} />
                  ))
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="mt-2 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Tap a player to make them captain
      </p>
    </div>
  );
}

function Token({ slot, onSetCaptain }: { slot: SquadSlot; onSetCaptain: () => void }) {
  return (
    <button
      type="button"
      onClick={onSetCaptain}
      title={`Make ${slot.player.name} captain`}
      className="group flex w-[56px] shrink-0 flex-col items-center gap-1 sm:w-[64px]"
    >
      <div
        className={cn(
          "relative rounded-full ring-2 transition-all",
          slot.captain ? "ring-violet-400" : "ring-white/30 group-hover:ring-violet-300 group-active:scale-95",
        )}
      >
        <PlayerAvatar src={slot.player.photo ?? undefined} name={slot.player.name} size={42} />
        {slot.captain ? (
          <span className="absolute -right-1 -top-1 inline-flex size-4 items-center justify-center rounded-full bg-violet-500 text-white shadow">
            <CrownIcon size={9} />
          </span>
        ) : null}
      </div>
      <span className="block w-full truncate rounded-sm bg-black/60 px-1 py-[1px] text-center font-mono text-[9px] leading-tight text-zinc-100">
        {shortName(slot.player.name)}
      </span>
    </button>
  );
}

function Markings() {
  return (
    <svg
      className="absolute inset-0 h-full w-full text-white/25"
      viewBox="0 0 100 70"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.25"
      aria-hidden
    >
      <rect x="2" y="2" width="96" height="66" />
      <line x1="2" y1="35" x2="98" y2="35" />
      <circle cx="50" cy="35" r="7" />
      <rect x="30" y="2" width="40" height="9" />
      <rect x="30" y="59" width="40" height="9" />
    </svg>
  );
}
