"use client";

import { cn } from "@/lib/utils";

export type PitchPlayer = { id: string; name: string; position: string };

const ROW_TOP: Record<string, number> = { FWD: 16, MID: 40, DEF: 64, GK: 87 };
const ORDER = ["FWD", "MID", "DEF", "GK"] as const;

function lastName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return parts.length > 1 ? parts[parts.length - 1]! : name;
}

export function FlatPitch({
  players,
  activeId,
  onSelect,
  accent = "bg-violet-500",
  className,
}: {
  players: PitchPlayer[];
  activeId?: string | null;
  onSelect?: (player: PitchPlayer) => void;
  accent?: string;
  className?: string;
}) {
  const byPos: Record<string, PitchPlayer[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const p of players) (byPos[p.position] ?? byPos.MID)!.push(p);

  return (
    <div
      className={cn(
        "relative aspect-[2/3] w-full overflow-hidden rounded-2xl border border-emerald-900/40",
        "bg-[linear-gradient(0deg,#10532f,#0e7a44_50%,#10532f)]",
        className,
      )}
    >
      {/* markings */}
      <div className="pointer-events-none absolute inset-3 rounded-lg border border-white/20" />
      <div className="pointer-events-none absolute left-3 right-3 top-1/2 h-px -translate-y-1/2 bg-white/20" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-16 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/20" />
      {/* mowed stripes */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className={cn("pointer-events-none absolute inset-x-0", i % 2 === 0 ? "bg-white/[0.03]" : "")}
          style={{ top: `${(i / 6) * 100}%`, height: `${100 / 6}%` }}
        />
      ))}

      {ORDER.flatMap((pos) => {
        const line = byPos[pos] ?? [];
        return line.map((p, i) => {
          const left = ((i + 1) / (line.length + 1)) * 100;
          const isActive = activeId === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={onSelect ? () => onSelect(p) : undefined}
              style={{ top: `${ROW_TOP[pos] ?? 50}%`, left: `${left}%` }}
              className={cn(
                "absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1",
                onSelect ? "cursor-pointer" : "cursor-default",
              )}
            >
              <span
                className={cn(
                  "flex size-7 items-center justify-center rounded-full border-2 text-[9px] font-semibold text-white shadow-md transition-transform",
                  isActive ? "border-white scale-110" : "border-white/40",
                  accent,
                )}
              >
                {pos}
              </span>
              <span className="max-w-[4.5rem] truncate rounded bg-black/50 px-1 text-[8px] font-medium text-white">
                {lastName(p.name)}
              </span>
            </button>
          );
        });
      })}
    </div>
  );
}
