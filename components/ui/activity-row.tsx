"use client";

import { motion } from "motion/react";

import type { ActivityItem } from "@/types";
import { AGENTS } from "@/lib/mock";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { TxLink } from "@/components/ui/tx-link";
import { formatMatchMinute, formatUsdt, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const KIND_BADGE: Record<ActivityItem["kind"], { label: string; tone: string }> = {
  mint: { label: "MINT", tone: "border-zinc-500/30 bg-zinc-500/5 text-zinc-300" },
  "position-open": {
    label: "OPEN",
    tone: "border-amber-500/30 bg-amber-500/5 text-amber-200",
  },
  "position-close": {
    label: "CLOSE",
    tone: "border-emerald-500/30 bg-emerald-500/5 text-emerald-200",
  },
  "roster-set": {
    label: "ROSTER",
    tone: "border-emerald-500/30 bg-emerald-500/5 text-emerald-200",
  },
  "session-key": {
    label: "SESSION",
    tone: "border-violet-500/30 bg-violet-500/5 text-violet-200",
  },
  settlement: {
    label: "SETTLE",
    tone: "border-violet-500/30 bg-violet-500/5 text-violet-200",
  },
};

interface ActivityRowProps {
  item: ActivityItem;
  index?: number;
  className?: string;
}

export function ActivityRow({ item, index = 0, className }: ActivityRowProps) {
  const agent = AGENTS[item.agent];
  const kind = KIND_BADGE[item.kind];
  const outcomeTone =
    item.outcome === "won"
      ? "text-emerald-300"
      : item.outcome === "lost"
      ? "text-red-300"
      : item.outcome === "pending"
      ? "text-amber-200"
      : "text-zinc-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ type: "spring", stiffness: 300, damping: 32, delay: index * 0.03 }}
      className={cn(
        "group relative grid grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-white/[0.04] px-4 py-3 transition-colors hover:bg-white/[0.02]",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <AgentAvatar agent={item.agent} size={32} />
        <div className="hidden sm:block">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            {agent.glyph}
          </p>
          <p className="font-mono text-[11px] text-zinc-300">
            {item.matchLabel}
            {item.matchMinute !== null ? (
              <span className="ml-2 text-zinc-500">{formatMatchMinute(item.matchMinute)}</span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.18em]",
              kind.tone,
            )}
          >
            {kind.label}
          </span>
          <p className="truncate text-sm text-zinc-100">{item.headline}</p>
        </div>
        <p className="mt-1 truncate text-[11px] text-zinc-500">{item.detail}</p>
      </div>

      <div className="flex items-center gap-4 text-right">
        {item.amountUsdt !== undefined && item.amountUsdt !== 0 ? (
          <span className={cn("font-mono text-sm tabular-nums", outcomeTone)}>
            {item.amountUsdt > 0 ? "+" : ""}
            {formatUsdt(item.amountUsdt)}
          </span>
        ) : null}
        <div className="flex flex-col items-end gap-0.5">
          <TxLink hash={item.txHash} chars={4} />
          <span className="font-mono text-[10px] text-zinc-600">{timeAgo(item.timestamp)}</span>
        </div>
      </div>
    </motion.div>
  );
}
