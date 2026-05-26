import { ChampionIcon } from "hugeicons-react";

import type { Fixture } from "@/lib/api/fixtures";
import { cn } from "@/lib/utils";

const ROUNDS: { key: string; label: string }[] = [
  { key: "Round of 32", label: "Round of 32" },
  { key: "Round of 16", label: "Round of 16" },
  { key: "Quarter-final", label: "Quarter-finals" },
  { key: "Semi-final", label: "Semi-finals" },
  { key: "Final", label: "Final" },
];

const THIRD_PLACE = "Play-off for third place";
const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });

function slotLabel(code: string): string {
  const winner = /^1([A-L])$/.exec(code);
  if (winner) return `Winner ${winner[1]}`;
  const runnerUp = /^2([A-L])$/.exec(code);
  if (runnerUp) return `Runner-up ${runnerUp[1]}`;
  const matchWinner = /^W(\d+)$/.exec(code);
  if (matchWinner) return `Winner M${matchWinner[1]}`;
  const matchLoser = /^RU(\d+)$/.exec(code);
  if (matchLoser) return `Loser M${matchLoser[1]}`;
  return code;
}

export function BracketView({ fixtures }: { fixtures: Fixture[] }) {
  const knockout = fixtures.filter((fixture) => fixture.group === null);
  const byStage = (key: string) =>
    knockout
      .filter((fixture) => fixture.stage === key)
      .sort((a, b) => (a.matchNumber ?? 0) - (b.matchNumber ?? 0));
  const third = byStage(THIRD_PLACE)[0];

  if (knockout.length === 0) {
    return (
      <p className="mx-auto max-w-3xl px-6 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground md:px-10">
        Bracket unavailable
      </p>
    );
  }

  return (
    <div className="overflow-x-auto px-6 pb-4 md:px-10">
      <div className="flex min-w-max gap-6">
        {ROUNDS.map((round) => {
          const matches = byStage(round.key);
          const isFinal = round.key === "Final";
          return (
            <div key={round.key} className="flex w-52 flex-col">
              <h3 className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
                {round.label}
              </h3>
              <div className="flex flex-1 flex-col justify-around gap-3">
                {matches.map((match) => (
                  <BracketCard key={match.id} fixture={match} highlight={isFinal} />
                ))}
                {isFinal && third ? <BracketCard fixture={third} thirdPlace /> : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BracketCard({
  fixture,
  highlight,
  thirdPlace,
}: {
  fixture: Fixture;
  highlight?: boolean;
  thirdPlace?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-3 transition-colors",
        highlight ? "border-violet-500/40" : "border-border hover:border-foreground/30",
      )}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
          {thirdPlace ? "3rd place" : `Match ${fixture.matchNumber ?? ""}`}
        </span>
        {highlight ? <ChampionIcon size={13} className="text-violet-500 dark:text-violet-300" /> : null}
      </div>
      <Slot code={fixture.homeCode} />
      <div className="my-1 flex items-center gap-2">
        <span className="h-px flex-1 bg-foreground/5" />
        <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">vs</span>
        <span className="h-px flex-1 bg-foreground/5" />
      </div>
      <Slot code={fixture.awayCode} />
      <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
        {dateFmt.format(fixture.kickoffAt)}
        {fixture.city ? ` · ${fixture.city}` : ""}
      </p>
    </div>
  );
}

function Slot({ code }: { code: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-1.5 shrink-0 rounded-full bg-violet-400/50" />
      <span className="truncate text-[13px] text-foreground">{slotLabel(code)}</span>
    </div>
  );
}
