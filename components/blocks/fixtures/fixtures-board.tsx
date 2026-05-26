"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Calendar01Icon, Location01Icon } from "hugeicons-react";

import { EmptyState } from "@/components/ui/empty-state";
import { FlagOrb } from "@/components/ui/flag-orb";
import type { Fixture } from "@/lib/api/fixtures";
import { teamName, WC_TEAMS } from "@/lib/wc-teams";
import { cn } from "@/lib/utils";

type Mode = "all" | "groups" | "knockout";

const MODES: { id: Mode; label: string }[] = [
  { id: "all", label: "All" },
  { id: "groups", label: "Group stage" },
  { id: "knockout", label: "Knockout" },
];

const dayFmt = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" });
const timeFmt = new Intl.DateTimeFormat("en-US", { hour: "2-digit", minute: "2-digit" });

export function FixturesBoard({ fixtures }: { fixtures: Fixture[] }) {
  const [mode, setMode] = useState<Mode>("all");

  const byDay = useMemo(() => {
    const filtered = fixtures.filter((fixture) => {
      if (mode === "groups") return fixture.group !== null;
      if (mode === "knockout") return fixture.group === null;
      return true;
    });
    const groups = new Map<string, Fixture[]>();
    for (const fixture of filtered) {
      const key = dayFmt.format(fixture.kickoffAt);
      const list = groups.get(key) ?? [];
      list.push(fixture);
      groups.set(key, list);
    }
    return [...groups.entries()];
  }, [fixtures, mode]);

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10">
      <div className="flex flex-wrap items-center gap-1.5">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
              mode === item.id
                ? "border-violet-400/50 bg-violet-500/[0.08] text-violet-100"
                : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-100",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {byDay.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={<Calendar01Icon size={16} />}
          label="NO_FIXTURES"
          hint="The schedule could not be loaded. Start the backend and seed fixtures, then refresh."
        />
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {byDay.map(([day, dayFixtures]) => (
            <div key={day}>
              <div className="mb-3 flex items-center gap-2">
                <Calendar01Icon size={14} className="text-violet-300" />
                <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-300">{day}</h3>
              </div>
              <div className="divide-y divide-white/[0.04] overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0E]">
                {dayFixtures.map((fixture) => (
                  <FixtureRow key={fixture.id} fixture={fixture} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function venueLabel(fixture: Fixture): string {
  const venue = fixture.venue ?? "Venue TBD";
  const city = fixture.city ?? "";
  if (!city || venue.toLowerCase().includes(city.toLowerCase())) return venue;
  return `${venue} · ${city}`;
}

function TeamSide({ code, align }: { code: string; align: "start" | "end" }) {
  const known = Boolean(WC_TEAMS[code]);
  const flag = <FlagOrb code={code} size={26} />;
  const name = <span className="truncate">{teamName(code)}</span>;
  const base = cn(
    "flex min-w-0 items-center gap-2 text-sm text-zinc-100",
    align === "end" ? "justify-end text-right" : "justify-start",
  );
  const body = align === "end" ? (
    <>
      {name}
      {flag}
    </>
  ) : (
    <>
      {flag}
      {name}
    </>
  );
  if (!known) return <span className={base}>{body}</span>;
  return (
    <Link href={`/teams/${code}`} title={`${teamName(code)} squad`} className={cn(base, "transition-colors hover:text-violet-200")}>
      {body}
    </Link>
  );
}

function FixtureRow({ fixture }: { fixture: Fixture }) {
  const label = fixture.group ? `Group ${fixture.group.replace(/^Group\s*/i, "")}` : fixture.stage ?? "Knockout";
  return (
    <div className="grid w-full grid-cols-1 items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-white/[0.02] md:grid-cols-[6.5rem_minmax(0,1fr)_minmax(0,12.5rem)]">
      <Link
        href={`/guide/${fixture.id}`}
        title={`Jack's read on ${teamName(fixture.homeCode)} v ${teamName(fixture.awayCode)}`}
        className="flex items-center gap-3 transition-colors hover:text-violet-200 md:flex-col md:items-start md:gap-1"
      >
        <span className="font-mono text-sm tabular-nums text-zinc-100">
          {timeFmt.format(fixture.kickoffAt)}
        </span>
        <span className="rounded-sm border border-white/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-zinc-400">
          {label}
        </span>
      </Link>

      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2 sm:gap-3">
        <TeamSide code={fixture.homeCode} align="end" />
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-600">v</span>
        <TeamSide code={fixture.awayCode} align="start" />
      </div>

      <Link
        href={`/guide/${fixture.id}`}
        title={`Jack's read on ${teamName(fixture.homeCode)} v ${teamName(fixture.awayCode)}`}
        className="flex min-w-0 items-center gap-1.5 text-zinc-500 transition-colors hover:text-zinc-300 md:justify-end"
      >
        <Location01Icon size={13} className="shrink-0" />
        <span className="truncate font-mono text-[10px] uppercase tracking-[0.16em]">
          {venueLabel(fixture)}
        </span>
      </Link>
    </div>
  );
}
