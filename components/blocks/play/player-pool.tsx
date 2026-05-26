"use client";

import { useMemo, useState } from "react";
import { Add01Icon, Search01Icon, Tick02Icon } from "hugeicons-react";

import { PlayerAvatar } from "@/components/ui/player-avatar";
import type { PlayerRecord } from "@/lib/api/schemas";
import {
  POSITIONS,
  SQUAD_COMPOSITION,
  type Position,
} from "@/lib/fantasy";
import { cn } from "@/lib/utils";

type Filter = "ALL" | Position;

interface PlayerPoolProps {
  players: PlayerRecord[];
  selectedIds: Set<string>;
  counts: Record<Position, number>;
  remaining: number;
  onAdd: (player: PlayerRecord) => void;
  onRemove: (id: string) => void;
}

const FILTERS: ReadonlyArray<Filter> = ["ALL", ...POSITIONS];

export function PlayerPool({
  players,
  selectedIds,
  counts,
  remaining,
  onAdd,
  onRemove,
}: PlayerPoolProps) {
  const [filter, setFilter] = useState<Filter>("ALL");
  const [query, setQuery] = useState("");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return players.filter((player) => {
      if (filter !== "ALL" && player.position !== filter) return false;
      if (q && !`${player.name} ${player.nation} ${player.teamCode}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [players, filter, query]);

  return (
    <div className="rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-1.5">
          {FILTERS.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={cn(
                "rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
                filter === value
                  ? "border-violet-400/50 bg-violet-500/[0.08] text-violet-700 dark:text-violet-100"
                  : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {value === "ALL"
                ? "All"
                : `${value} ${counts[value]}/${SQUAD_COMPOSITION[value]}`}
            </button>
          ))}
        </div>
        <label className="flex h-9 items-center gap-2 rounded-full border border-border bg-muted px-3">
          <Search01Icon size={14} className="text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search players"
            aria-label="Search players"
            className="w-40 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
        </label>
      </div>

      <div className="max-h-[28rem] divide-y divide-border overflow-y-auto">
        {visible.length === 0 ? (
          <p className="px-4 py-10 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            No players found
          </p>
        ) : (
          visible.map((player) => {
            const selected = selectedIds.has(player.id);
            const positionFull = counts[player.position] >= SQUAD_COMPOSITION[player.position];
            const tooExpensive = player.priceMillions > remaining;
            const blocked = !selected && (positionFull || tooExpensive);
            return (
              <PoolRow
                key={player.id}
                player={player}
                selected={selected}
                blocked={blocked}
                onToggle={() => (selected ? onRemove(player.id) : onAdd(player))}
              />
            );
          })
        )}
      </div>
    </div>
  );
}

function PoolRow({
  player,
  selected,
  blocked,
  onToggle,
}: {
  player: PlayerRecord;
  selected: boolean;
  blocked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2.5">
      <PlayerAvatar src={player.photo ?? undefined} name={player.name} size={30} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm text-foreground">{player.name}</p>
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {player.position} · {player.teamCode}
        </p>
      </div>
      <span className="font-mono text-sm tabular-nums text-muted-foreground">
        {player.priceMillions.toFixed(1)}m
      </span>
      <button
        type="button"
        onClick={onToggle}
        disabled={blocked}
        aria-label={selected ? `Remove ${player.name}` : `Add ${player.name}`}
        className={cn(
          "inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors",
          "disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground",
          selected
            ? "border-emerald-500/40 bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-300 hover:border-red-500/40 hover:bg-red-500/[0.08] hover:text-red-600 dark:hover:text-red-300"
            : "border-border text-muted-foreground hover:border-violet-400/50 hover:text-violet-500 dark:hover:text-violet-300",
        )}
      >
        {selected ? <Tick02Icon size={14} /> : <Add01Icon size={14} />}
      </button>
    </div>
  );
}
