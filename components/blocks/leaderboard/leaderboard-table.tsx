"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Sparkline } from "@/components/ui/sparkline";
import { AGENTS, LEADERBOARD, AGENT_LIST } from "@/lib/mock";
import { formatDelta, formatPercent, formatUsdt, truncateAddress, explorerAddressUrl } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AgentSlug } from "@/types";

type Filter = "all" | AgentSlug;

export function LeaderboardTable() {
  const [filter, setFilter] = useState<Filter>("all");

  const rows = useMemo(() => {
    return filter === "all"
      ? LEADERBOARD
      : LEADERBOARD.filter((r) => r.agent === filter);
  }, [filter]);

  const podium = LEADERBOARD.slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10">
      <div className="grid gap-4 md:grid-cols-3">
        {podium.map((row, i) => {
          const agent = AGENTS[row.agent];
          return (
            <motion.div
              key={row.rank}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30, delay: i * 0.05 }}
              className={cn(
                "flex flex-col gap-4 rounded-3xl border bg-[#0B0B0E] p-6",
                i === 0
                  ? "border-violet-500/40 md:order-2 md:-translate-y-3"
                  : i === 1
                  ? "border-white/10 md:order-1"
                  : "border-white/10 md:order-3",
              )}
            >
              <div className="flex items-center justify-between">
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.22em]",
                    i === 0 ? "text-violet-200" : "text-zinc-500",
                  )}
                >
                  Rank · {String(row.rank).padStart(2, "0")}
                </span>
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase tracking-[0.22em]",
                    row.delta24h >= 0 ? "text-emerald-300" : "text-red-300",
                  )}
                >
                  {row.delta24h >= 0 ? "▲" : "▼"} {formatUsdt(Math.abs(row.delta24h), { compact: true })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <AgentAvatar agent={row.agent} size={48} />
                <div>
                  <a
                    href={explorerAddressUrl(row.wallet)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="block font-mono text-base text-zinc-100 hover:text-violet-200"
                  >
                    {truncateAddress(row.wallet, 6)}
                  </a>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    {agent.glyph}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                <Cell label="P&L" value={row.agent === "scout" ? `${row.decisions} mints` : formatDelta(row.pnlUsdt)} />
                <Cell label="Decisions" value={row.decisions.toString()} />
                <Cell label="Win rate" value={formatPercent(row.winRatePct, 0)} />
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-12 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-[#0B0B0E] p-2">
        <Chip active={filter === "all"} onClick={() => setFilter("all")} label={`All · ${LEADERBOARD.length}`} />
        {AGENT_LIST.map((a) => (
          <Chip
            key={a.slug}
            active={filter === a.slug}
            onClick={() => setFilter(a.slug)}
            label={`${a.name} · ${LEADERBOARD.filter((r) => r.agent === a.slug).length}`}
          />
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B0E]">
        <div className="grid grid-cols-12 gap-3 border-b border-white/5 bg-white/[0.02] px-6 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          <div className="col-span-1">Rank</div>
          <div className="col-span-4">Wallet · Agent</div>
          <div className="col-span-2">P&L</div>
          <div className="col-span-1">Wins</div>
          <div className="col-span-2">Win rate</div>
          <div className="col-span-2 text-right">24h</div>
        </div>
        {rows.map((row, i) => {
          const agent = AGENTS[row.agent];
          const positive = row.delta24h >= 0;
          const data = agent.stats.trackRecord;
          return (
            <motion.div
              key={`${row.rank}-${row.wallet}`}
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30, delay: i * 0.02 }}
              className="grid grid-cols-12 items-center gap-3 border-b border-white/[0.04] px-6 py-4 transition-colors last:border-b-0 hover:bg-white/[0.02]"
            >
              <div className="col-span-1 font-mono text-sm text-zinc-200">{String(row.rank).padStart(2, "0")}</div>
              <div className="col-span-4 flex items-center gap-3">
                <AgentAvatar agent={row.agent} size={32} />
                <div>
                  <a
                    href={explorerAddressUrl(row.wallet)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="font-mono text-sm text-zinc-100 hover:text-violet-200"
                  >
                    {truncateAddress(row.wallet, 4)}
                  </a>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    {agent.glyph}
                  </p>
                </div>
              </div>
              <div className="col-span-2 font-mono text-sm tabular-nums text-zinc-200">
                {row.agent === "scout"
                  ? `${row.decisions} mints`
                  : formatDelta(row.pnlUsdt)}
              </div>
              <div className="col-span-1 font-mono text-sm text-zinc-300 tabular-nums">{row.decisions}</div>
              <div className="col-span-2 font-mono text-sm text-zinc-200 tabular-nums">
                {formatPercent(row.winRatePct, 0)}
              </div>
              <div className="col-span-2 flex items-center justify-end gap-3">
                <Sparkline
                  data={data}
                  stroke={positive ? "#34D399" : "#F87171"}
                  width={80}
                  height={26}
                  className="w-20"
                />
                <span
                  className={cn(
                    "font-mono text-[11px] tabular-nums",
                    positive ? "text-emerald-300" : "text-red-300",
                  )}
                >
                  {positive ? "+" : "−"}
                  {formatUsdt(Math.abs(row.delta24h))}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function Chip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
        active
          ? "border-white/25 bg-white/[0.08] text-zinc-100"
          : "border-white/10 bg-transparent text-zinc-400 hover:border-white/25 hover:text-zinc-100",
      )}
    >
      {label}
    </button>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </span>
      <span className="font-mono text-sm text-zinc-100 tabular-nums">{value}</span>
    </div>
  );
}
