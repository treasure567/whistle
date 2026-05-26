"use client";

import { motion } from "motion/react";
import { ChampionIcon } from "hugeicons-react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { AGENTS } from "@/lib/mock";
import { formatUsdt } from "@/lib/format";
import type { AgentLeaderboardRow } from "@/lib/api/schemas";
import type { AgentSlug } from "@/types";

const KIND_TO_SLUG: Record<AgentLeaderboardRow["kind"], AgentSlug> = {
  SCOUT: "scout",
  BOOKIE: "bookie",
  MANAGER: "manager",
};

function toUsdt(raw: string): number {
  const value = Number(raw);
  return Number.isFinite(value) ? value / 1e18 : 0;
}

export function LeaderboardTable({ rows }: { rows: AgentLeaderboardRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <EmptyState
          icon={<ChampionIcon size={16} />}
          label="NO_DECISIONS_YET"
          hint="Fund Emma, Jack, or Tom and their on-chain record builds here as they act during matches."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-4 px-6 md:grid-cols-3 md:px-10">
      {rows.map((row, index) => {
        const slug = KIND_TO_SLUG[row.kind];
        const agent = AGENTS[slug];
        return (
          <motion.div
            key={row.kind}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: index * 0.05 }}
            className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
          >
            <div className="flex items-center gap-3">
              <AgentAvatar agent={slug} size={44} />
              <div>
                <p className="text-base font-semibold tracking-tight text-foreground">{agent.name}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {agent.role}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
              <Cell label="Decisions" value={row.decisions.toString()} />
              <Cell label="Funded" value={formatUsdt(toUsdt(row.allocatedUsdt), { compact: true })} />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</span>
      <span className="font-mono text-lg tabular-nums text-foreground">{value}</span>
    </div>
  );
}
