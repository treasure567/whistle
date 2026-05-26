"use client";

import { PlayerAvatar } from "@/components/ui/player-avatar";
import { cn } from "@/lib/utils";

export type PitchPlayer = { id: string; name: string; position: string; photo?: string | null };

const ROWS: ReadonlyArray<{ pos: string; label: string }> = [
  { pos: "FWD", label: "forwards" },
  { pos: "MID", label: "midfield" },
  { pos: "DEF", label: "defence" },
  { pos: "GK", label: "keeper" },
];

function shortName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return name;
  return `${parts[0]![0]}. ${parts[parts.length - 1]}`;
}

export function FlatPitch({
  players,
  activeId,
  highlightIds,
  onSelect,
  className,
}: {
  players: PitchPlayer[];
  activeId?: string | null;
  highlightIds?: ReadonlyArray<string>;
  onSelect?: (player: PitchPlayer) => void;
  className?: string;
}) {
  const byPos: Record<string, PitchPlayer[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const p of players) (byPos[p.position] ?? byPos.MID)!.push(p);

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-emerald-500/25 bg-gradient-to-b from-emerald-900/50 via-emerald-800/35 to-emerald-900/55 shadow-2xl shadow-emerald-950/30",
        className,
      )}
    >
      <Markings />
      <div className="relative z-10 flex aspect-[16/11] flex-col justify-evenly gap-1 px-2 py-6 sm:px-5">
        {ROWS.map(({ pos, label }) => {
          const line = byPos[pos] ?? [];
          return (
            <div key={pos} className="flex items-center justify-evenly gap-1">
              {line.length === 0 ? (
                <span className="flex h-[40px] items-center justify-center rounded-full border border-dashed border-white/25 px-4 font-mono text-[9px] uppercase tracking-[0.18em] text-white/40">
                  {label}
                </span>
              ) : (
                line.map((p) => (
                  <Token
                    key={p.id}
                    player={p}
                    active={activeId === p.id}
                    valid={Boolean(highlightIds?.includes(p.id))}
                    dim={Boolean(activeId) && activeId !== p.id && !highlightIds?.includes(p.id)}
                    onSelect={onSelect ? () => onSelect(p) : undefined}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Token({
  player,
  active,
  valid,
  dim,
  onSelect,
}: {
  player: PitchPlayer;
  active: boolean;
  valid?: boolean;
  dim?: boolean;
  onSelect?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!onSelect}
      title={player.name}
      className={cn(
        "group flex w-[52px] shrink-0 flex-col items-center gap-1 transition-opacity sm:w-[60px]",
        onSelect ? "cursor-pointer" : "cursor-default",
        dim && "opacity-40",
      )}
    >
      <div
        className={cn(
          "relative rounded-full ring-2 transition-all",
          active
            ? "scale-110 ring-violet-400"
            : valid
              ? "ring-emerald-400 group-hover:ring-emerald-300"
              : "ring-white/30 group-hover:ring-violet-300 group-active:scale-95",
        )}
      >
        <PlayerAvatar src={player.photo ?? undefined} name={player.name} size={40} />
        <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-1 font-mono text-[7px] uppercase tracking-wider text-white/80">
          {player.position}
        </span>
      </div>
      <span className="block w-full truncate rounded-sm bg-black/60 px-1 py-[1px] text-center font-mono text-[9px] leading-tight text-zinc-100">
        {shortName(player.name)}
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
