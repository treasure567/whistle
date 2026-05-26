"use client";

import {
  ArrowDown01Icon,
  ArrowUp01Icon,
  FootballIcon,
} from "hugeicons-react";

import type { MatchEvent } from "@/types";
import { formatMatchMinute } from "@/lib/format";
import { SQUADS } from "@/lib/mock/squads";
import { cn } from "@/lib/utils";

interface MatchEventsTimelineProps {
  events: ReadonlyArray<MatchEvent>;
  homeCode: string;
  awayCode: string;
}

function shortName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return name;
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}

function eventLabel(event: MatchEvent): string {
  const squad = SQUADS[event.nation];
  const found = squad?.players.find((p) => p.number === event.jersey);
  const player = found ? shortName(found.name) : `${event.nation} ${event.jersey}`;
  switch (event.type) {
    case "goal":
      return `Goal · ${player}`;
    case "own-goal":
      return `Own goal · ${player}`;
    case "penalty":
      return `Penalty · ${player}`;
    case "yellow-card":
      return `Yellow card · ${player}`;
    case "red-card":
      return `Red card · ${player}`;
    case "substitution":
      return event.detail ?? `Sub · ${player}`;
    default:
      return player;
  }
}

function EventIcon({ type }: { type: MatchEvent["type"] }) {
  if (type === "goal" || type === "penalty" || type === "own-goal") {
    return <FootballIcon className="size-3.5 text-foreground" aria-hidden />;
  }
  if (type === "red-card") {
    return (
      <span
        aria-hidden
        className="inline-block size-3 rounded-sm bg-red-500"
      />
    );
  }
  if (type === "yellow-card") {
    return (
      <span
        aria-hidden
        className="inline-block size-3 rounded-sm bg-amber-400"
      />
    );
  }
  return type === "substitution" ? (
    <ArrowUp01Icon className="size-3 text-emerald-400" aria-hidden />
  ) : (
    <ArrowDown01Icon className="size-3 text-muted-foreground" aria-hidden />
  );
}

export function MatchEventsTimeline({
  events,
  homeCode,
  awayCode,
}: MatchEventsTimelineProps) {
  if (events.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card p-8">
        <div className="flex items-center gap-2">
          <span aria-hidden className="dot-live animate-pulse-glow" style={{ position: "static" }} />
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">
            No events yet
          </span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Goals, cards, and subs will appear here once the match gets going.
        </p>
      </div>
    );
  }

  return (
    <ol className="space-y-0 rounded-2xl border border-border bg-card">
      {events.map((event, index) => {
        const sideLabel = event.team === "home" ? homeCode : awayCode;
        return (
          <li
            key={event.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3",
              index > 0 && "border-t border-border",
            )}
          >
            <span className="w-10 shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {formatMatchMinute(event.minute)}
            </span>
            <span className="flex size-8 shrink-0 items-center justify-center rounded-sm border border-border bg-muted">
              <EventIcon type={event.type} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-foreground">{eventLabel(event)}</p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {sideLabel}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
