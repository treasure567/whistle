"use client";

import { PlayerAvatar } from "@/components/ui/player-avatar";
import { SQUADS } from "@/lib/mock/squads";
import { cn } from "@/lib/utils";
import type { LineupPlayer, MatchLineup, SquadPlayer } from "@/types";

interface PhotoPitchProps {
  lineup: MatchLineup;
  className?: string;
}

const ROW_ORDER: ReadonlyArray<LineupPlayer["row"]> = [
  "gk",
  "df",
  "cdm",
  "cm",
  "cam",
  "fw",
];

const HOME_ACCENT = "ring-violet-400/80 bg-violet-500/20";
const AWAY_ACCENT = "ring-zinc-200/70 bg-zinc-800/40";

const HOME_BADGE = "bg-violet-500 text-white";
const AWAY_BADGE = "bg-zinc-100 text-zinc-900";

function shortName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return name;
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}

function findPlayer(nation: string, jersey: number): SquadPlayer | undefined {
  return SQUADS[nation]?.players.find((p) => p.number === jersey);
}

function buildRows(
  players: ReadonlyArray<LineupPlayer>,
): ReadonlyArray<ReadonlyArray<LineupPlayer>> {
  return ROW_ORDER.map((row) => players.filter((p) => p.row === row)).filter(
    (row) => row.length > 0,
  );
}

function Token({ slot, side }: { slot: LineupPlayer; side: "home" | "away" }) {
  const player = findPlayer(slot.nation, slot.jersey);
  const displayName = player ? shortName(player.name) : `${slot.nation} ${slot.jersey}`;
  const accent = side === "home" ? HOME_ACCENT : AWAY_ACCENT;
  const badge = side === "home" ? HOME_BADGE : AWAY_BADGE;

  return (
    <div className="flex w-[60px] flex-col items-center gap-1">
      <div className={cn("relative rounded-full ring-2", accent)}>
        <PlayerAvatar src={player?.photo} name={displayName} size={44} />
        <span
          className={cn(
            "absolute -bottom-1 -right-1 inline-flex h-[18px] min-w-[20px] items-center justify-center rounded-full px-1 font-mono text-[10px] font-semibold leading-none tabular-nums shadow",
            badge,
          )}
        >
          {slot.jersey}
        </span>
      </div>
      <span className="block w-full truncate rounded-sm bg-black/70 px-1 py-[1px] text-center font-mono text-[9px] leading-tight tracking-tight text-zinc-100">
        {displayName}
      </span>
    </div>
  );
}

function TeamHalf({
  players,
  side,
}: {
  players: ReadonlyArray<LineupPlayer>;
  side: "home" | "away";
}) {
  const rows = buildRows(players);
  // away renders top-to-bottom with GK at top (defending top goal),
  // home renders top-to-bottom with FW first (attacking up toward center),
  // GK at bottom (defending bottom goal).
  const orderedRows = side === "away" ? rows : [...rows].reverse();

  return (
    <div className="flex flex-1 flex-col justify-evenly gap-1 py-4">
      {orderedRows.map((row, idx) => (
        <div
          key={`${side}-row-${idx}`}
          className="flex items-center justify-evenly gap-1 px-2"
        >
          {row.map((slot) => (
            <Token key={`${slot.nation}-${slot.jersey}`} slot={slot} side={side} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function PhotoPitch({ lineup, className }: PhotoPitchProps) {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-emerald-900/55 via-emerald-800/40 to-emerald-900/55 shadow-2xl shadow-emerald-950/40",
        className,
      )}
    >
      <PitchMarkings />
      <div className="relative z-10 flex aspect-[3/4] w-full flex-col sm:aspect-[5/7]">
        <TeamHalf players={lineup.away} side="away" />
        <div className="h-px bg-white/40" />
        <TeamHalf players={lineup.home} side="home" />
      </div>
    </div>
  );
}

function PitchMarkings() {
  return (
    <svg
      className="absolute inset-0 h-full w-full text-white/30"
      viewBox="0 0 100 140"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.3"
      aria-hidden
    >
      <rect x="2" y="2" width="96" height="136" />
      <line x1="2" y1="70" x2="98" y2="70" />
      <circle cx="50" cy="70" r="9" />
      <circle cx="50" cy="70" r="0.6" fill="currentColor" />
      <rect x="22" y="2" width="56" height="14" />
      <rect x="38" y="2" width="24" height="5" />
      <circle cx="50" cy="12" r="0.6" fill="currentColor" />
      <path d="M 39 16 A 11 11 0 0 0 61 16" />
      <path d="M 0 0 A 4 4 0 0 1 4 4" transform="translate(-2 -2)" />
      <rect x="22" y="124" width="56" height="14" />
      <rect x="38" y="133" width="24" height="5" />
      <circle cx="50" cy="128" r="0.6" fill="currentColor" />
      <path d="M 39 124 A 11 11 0 0 1 61 124" />
    </svg>
  );
}
