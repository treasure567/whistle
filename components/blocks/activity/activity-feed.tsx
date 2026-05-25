"use client";

import { useMemo, useState } from "react";

import { ActivityRow, ActivityTableHeader } from "@/components/ui/activity-row";
import { EmptyState } from "@/components/ui/empty-state";
import { AGENT_LIST } from "@/lib/mock";
import { useLiveFeed } from "@/hooks/use-live-feed";
import { cn } from "@/lib/utils";
import type { ActivityItem, AgentSlug } from "@/types";

type AgentFilter = "all" | AgentSlug;
type KindFilter = "all" | ActivityItem["kind"];

const KIND_OPTIONS: ReadonlyArray<{ value: KindFilter; label: string }> = [
  { value: "all", label: "All kinds" },
  { value: "mint", label: "Moments" },
  { value: "position-open", label: "Open" },
  { value: "position-close", label: "Close" },
  { value: "roster-set", label: "Roster" },
  { value: "session-key", label: "Session" },
  { value: "settlement", label: "Settle" },
];

interface ActivityFeedProps {
  initialAgent?: AgentFilter;
  items?: ReadonlyArray<ActivityItem>;
}

export function ActivityFeed({ initialAgent = "all", items = [] }: ActivityFeedProps) {
  const [agent, setAgent] = useState<AgentFilter>(initialAgent);
  const [kind, setKind] = useState<KindFilter>("all");
  const live = useLiveFeed();

  const all = useMemo(() => [...live, ...items], [live, items]);

  const filtered = useMemo(() => {
    return all.filter((item) => {
      if (agent !== "all" && item.agent !== agent) return false;
      if (kind !== "all" && item.kind !== kind) return false;
      return true;
    });
  }, [all, agent, kind]);

  const counts = useMemo(() => {
    const map: Record<AgentFilter, number> = { all: all.length, scout: 0, bookie: 0, manager: 0 };
    for (const item of all) map[item.agent] += 1;
    return map;
  }, [all]);

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#0B0B0E] p-2">
        <Chip
          active={agent === "all"}
          onClick={() => setAgent("all")}
          label={`All · ${counts.all}`}
        />
        {AGENT_LIST.map((a) => (
          <Chip
            key={a.slug}
            active={agent === a.slug}
            onClick={() => setAgent(a.slug)}
            label={`${a.name} · ${counts[a.slug]}`}
          />
        ))}
        <span className="mx-1 h-5 w-px bg-white/10" aria-hidden />
        {KIND_OPTIONS.map((opt) => (
          <Chip
            key={opt.value}
            active={kind === opt.value}
            subtle
            onClick={() => setKind(opt.value)}
            label={opt.label}
          />
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0E]">
        {filtered.length === 0 ? (
          <EmptyState
            label="No matching decisions"
            hint="Adjust the filters above. Agents will fire on the next kickoff."
            className="border-0 rounded-none"
          />
        ) : (
          <>
            <ActivityTableHeader />
            {filtered.map((item, i) => (
              <ActivityRow key={item.id} item={item} index={i} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
  subtle,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  subtle?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
        active
          ? subtle
            ? "border-violet-500/40 bg-violet-500/[0.08] text-violet-100"
            : "border-white/25 bg-white/[0.08] text-zinc-100"
          : "border-white/10 bg-transparent text-zinc-400 hover:border-white/25 hover:text-zinc-100",
      )}
    >
      {label}
    </button>
  );
}
