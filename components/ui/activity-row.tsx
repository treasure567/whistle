"use client";

import { motion } from "motion/react";

import type { ActivityItem } from "@/types";
import { AGENTS } from "@/lib/mock";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { TxLink } from "@/components/ui/tx-link";
import { formatMatchMinute, formatUsdt, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";

const ROW_GRID =
  "grid grid-cols-[72px_1fr_auto] items-center gap-x-4 gap-y-1 px-4 py-4 sm:grid-cols-[120px_1fr_96px_112px] sm:gap-x-6 sm:px-6";

interface ActivityTableHeaderProps {
  className?: string;
}

export function ActivityTableHeader({ className }: ActivityTableHeaderProps) {
  return (
    <div
      className={cn(
        ROW_GRID,
        "border-b border-border bg-foreground/[0.02] py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground",
        className,
      )}
    >
      <div>Agent</div>
      <div>Action</div>
      <div className="hidden text-right sm:block">Amount</div>
      <div className="hidden text-right sm:block">Tx</div>
    </div>
  );
}

interface ActivityRowProps {
  item: ActivityItem;
  index?: number;
  className?: string;
}

function OffChainTag() {
  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">off-chain</span>
  );
}

export function ActivityRow({ item, index = 0, className }: ActivityRowProps) {
  const agent = AGENTS[item.agent];
  const onchain = Boolean(item.txHash && item.txHash !== "0x" && item.txHash.length >= 42);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-15%" }}
      transition={{ type: "spring", stiffness: 300, damping: 32, delay: index * 0.03 }}
      className={cn(
        ROW_GRID,
        "group border-b border-border transition-colors last:border-b-0 hover:bg-foreground/[0.02]",
        className,
      )}
    >
      <div className="flex items-center gap-3">
        <AgentAvatar agent={item.agent} size={40} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-foreground">{agent.name}</p>
          <p className="mt-0.5 truncate font-mono text-[10px] text-muted-foreground">
            {item.matchLabel}
            {item.matchMinute !== null ? (
              <span className="ml-1.5 text-muted-foreground">{formatMatchMinute(item.matchMinute)}</span>
            ) : null}
          </p>
        </div>
      </div>

      <div className="min-w-0">
        <p className="truncate text-sm text-foreground">{item.headline}</p>
        <p className="mt-1 truncate text-[11px] text-muted-foreground">{item.detail}</p>
        <div className="mt-2 flex items-center justify-between gap-3 sm:hidden">
          {item.amountUsdt !== undefined && item.amountUsdt !== 0 ? (
            <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
              {item.amountUsdt > 0 ? "+" : ""}
              {formatUsdt(item.amountUsdt)}
            </span>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-3">
            {onchain ? <TxLink hash={item.txHash} chars={4} /> : <OffChainTag />}
            <span className="font-mono text-[10px] text-muted-foreground">{timeAgo(item.timestamp)}</span>
          </div>
        </div>
      </div>

      <div className="hidden text-right sm:block">
        {item.amountUsdt !== undefined && item.amountUsdt !== 0 ? (
          <span className="font-mono text-sm tabular-nums text-muted-foreground">
            {item.amountUsdt > 0 ? "+" : ""}
            {formatUsdt(item.amountUsdt)}
          </span>
        ) : (
          <span className="font-mono text-sm text-muted-foreground">—</span>
        )}
      </div>

      <div className="hidden flex-col items-end gap-0.5 sm:flex">
        {onchain ? <TxLink hash={item.txHash} chars={4} /> : <OffChainTag />}
        <span className="font-mono text-[10px] text-muted-foreground">{timeAgo(item.timestamp)}</span>
      </div>
    </motion.div>
  );
}
