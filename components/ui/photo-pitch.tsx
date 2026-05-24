"use client";

import { PlayerAvatar } from "@/components/ui/player-avatar";
import { SQUADS } from "@/lib/mock/squads";
import { cn } from "@/lib/utils";
import type { LineupPlayer, MatchLineup, SquadPlayer } from "@/types";

interface PhotoPitchProps {
  lineup: MatchLineup;
  className?: string;
}

const ROWS: ReadonlyArray<LineupPlayer["row"]> = ["gk", "df", "cdm", "cm", "cam", "fw"];

const HOME_ACCENT = "ring-violet-400/70 bg-violet-500/15";
const AWAY_ACCENT = "ring-zinc-300/60 bg-zinc-800/40";

const HOME_BADGE = "bg-violet-500 text-white";
const AWAY_BADGE = "bg-zinc-200 text-zinc-900";

function shortName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return name;
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}

function findPlayer(nation: string, jersey: number): SquadPlayer | undefined {
  return SQUADS[nation]?.players.find((p) => p.number === jersey);
}

function buildRows(players: ReadonlyArray<LineupPlayer>): ReadonlyArray<ReadonlyArray<LineupPlayer>> {
  return ROWS.map((row) => players.filter((p) => p.row === row)).filter(
    (row) => row.length > 0,
  );
}

interface TokenProps {
  slot: LineupPlayer;
  side: "home" | "away";
}

function Token({ slot, side }: TokenProps) {
  const player = findPlayer(slot.nation, slot.jersey);
  const displayName = player ? shortName(player.name) : `${slot.nation} ${slot.jersey}`;
  const accent = side === "home" ? HOME_ACCENT : AWAY_ACCENT;
  const badge = side === "home" ? HOME_BADGE : AWAY_BADGE;

  return (
    <div className="flex w-[68px] flex-col items-center gap-1">
      <div className={cn("relative rounded-full ring-2", accent)}>
        <PlayerAvatar src={player?.photo} name={displayName} size={44} />
        <span
          className={cn(
            "absolute -bottom-1 -right-1 inline-flex h-4 min-w-[18px] items-center justify-center rounded-full px-1 font-mono text-[9px] font-semibold tabular-nums shadow",
            badge,
          )}
        >
          {slot.jersey}
        </span>
      </div>
      <span className="block w-full truncate rounded-sm bg-black/65 px-1 py-[1px] text-center font-mono text-[9px] leading-tight tracking-tight text-zinc-100">
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
  const orderedRows = side === "home" ? rows : [...rows].reverse();

  return (
    <div className="flex flex-1 flex-col justify-between gap-2 py-3">
      {orderedRows.map((row, idx) => (
        <div
          key={`${side}-row-${idx}`}
          className="flex items-center justify-evenly gap-2 px-2"
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
        "relative w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-emerald-900/40 via-emerald-800/30 to-emerald-900/40 shadow-2xl shadow-emerald-950/40",
        className,
      )}
    >
      <PitchMarkings />
      <div className="relative z-10 flex h-full min-h-[640px] flex-col">
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
      viewBox="0 0 100 150"
      preserveAspectRatio="none"
      fill="none"
      stroke="currentColor"
      strokeWidth="0.3"
      aria-hidden
    >
      <rect x="2" y="2" width="96" height="146" />
      <line x1="2" y1="75" x2="98" y2="75" />
      <circle cx="50" cy="75" r="9" />
      <circle cx="50" cy="75" r="0.6" fill="currentColor" />
      <rect x="22" y="2" width="56" height="16" />
      <rect x="36" y="2" width="28" height="6" />
      <circle cx="50" cy="14" r="0.6" fill="currentColor" />
      <path d="M 38 18 A 10 10 0 0 0 62 18" />
      <rect x="22" y="132" width="56" height="16" />
      <rect x="36" y="142" width="28" height="6" />
      <circle cx="50" cy="136" r="0.6" fill="currentColor" />
      <path d="M 38 132 A 10 10 0 0 1 62 132" />
    </svg>
  );
}
