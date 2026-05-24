"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  AddCircleIcon,
  Key01Icon,
  WalletAdd01Icon,
} from "hugeicons-react";
import { useAccount } from "wagmi";

import { ActivityRow } from "@/components/ui/activity-row";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/ui/connect-button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatBlock } from "@/components/ui/stat-block";
import { TxLink } from "@/components/ui/tx-link";
import {
  ACTIVITY,
  AGENTS,
  ALLOCATIONS,
  MINTS,
  POSITIONS,
  ROSTERS,
} from "@/lib/mock";
import { formatUsdt, formatPercent, timeAgo, truncateAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Allocation } from "@/types";

const spring = { type: "spring" as const, stiffness: 280, damping: 30 };

export function DashboardShell() {
  const { isConnected, address } = useAccount();

  if (!isConnected || !address) {
    return (
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <div className="rounded-3xl border border-white/10 bg-[#0B0B0E] p-10 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/[0.06] text-violet-200">
            <WalletAdd01Icon size={20} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-zinc-100">
            Connect to see your stable
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-400">
            Your allocations, agent positions, and mints live behind your
            wallet. Connect on X Layer to load them.
          </p>
          <div className="mt-6 flex justify-center">
            <ConnectButton />
          </div>
          <div className="mt-8 grid gap-3 text-left md:grid-cols-3">
            {[
              ["Active sessions", "—"],
              ["Allocations", "—"],
              ["Settled P&L", "—"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/[0.04] bg-[#0E0E12] p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  {label}
                </p>
                <p className="mt-1 font-mono text-2xl text-zinc-500">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalAllocated = ALLOCATIONS.reduce(
    (sum, a) => (a.status === "active" ? sum + a.ceilingUsdt : sum),
    0,
  );
  const remaining = ALLOCATIONS.reduce(
    (sum, a) => (a.status === "active" ? sum + a.remainingUsdt : sum),
    0,
  );
  const positionsPnl = POSITIONS.reduce(
    (sum, p) => sum + (p.settledPnlUsdt ?? 0),
    0,
  );
  const openExposure = POSITIONS.filter((p) => p.status === "open").reduce(
    (sum, p) => sum + p.stakeUsdt,
    0,
  );
  const settledWins = POSITIONS.filter((p) => p.status === "won").length;
  const settledLosses = POSITIONS.filter((p) => p.status === "lost").length;
  const winRate =
    settledWins + settledLosses > 0
      ? (settledWins / (settledWins + settledLosses)) * 100
      : 0;

  const myActivity = ACTIVITY.slice(0, 6);
  const myMints = MINTS.slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
            Dashboard
          </span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-100 md:text-4xl">
            Your stable
          </h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500">
            {truncateAddress(address, 6)} · X Layer
          </p>
        </div>
        <Link href="/allocate">
          <Button variant="violet" size="pill">
            New allocation
            <AddCircleIcon size={14} />
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="mt-10 grid gap-4 rounded-3xl border border-white/10 bg-[#0B0B0E] p-6 md:grid-cols-4"
      >
        <StatBlock
          label="Capital allocated"
          value={formatUsdt(totalAllocated, { compact: true })}
          hint={`${ALLOCATIONS.filter((a) => a.status === "active").length} active sessions`}
        />
        <StatBlock
          label="Remaining"
          value={formatUsdt(remaining, { compact: true })}
          hint={`${formatPercent((remaining / Math.max(totalAllocated, 1)) * 100, 0)} of ceiling`}
        />
        <StatBlock
          label="Settled P&L"
          value={
            <span className={cn(positionsPnl >= 0 ? "text-emerald-300" : "text-red-300")}>
              {positionsPnl > 0 ? "+" : ""}
              {formatUsdt(positionsPnl)}
            </span>
          }
          hint={`${settledWins}W / ${settledLosses}L`}
        />
        <StatBlock
          label="Bookie win rate"
          value={formatPercent(winRate, 1)}
          hint={`open exposure ${formatUsdt(openExposure)}`}
        />
      </motion.div>

      <section id="sessions" className="mt-12">
        <SectionHeader
          eyebrow="Active sessions"
          title="Your allocations"
          action={
            <Link href="/allocate" className="font-mono text-[11px] uppercase tracking-[0.22em] text-violet-200 hover:text-violet-100">
              + add session
            </Link>
          }
        />
        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B0E]">
          {ALLOCATIONS.length === 0 ? (
            <EmptyState
              label="No allocations yet"
              hint="Hire an agent and set a ceiling to get started."
              className="border-0 rounded-none"
              action={
                <Link href="/allocate">
                  <Button variant="violet" size="sm">
                    Allocate
                  </Button>
                </Link>
              }
            />
          ) : (
            <div>
              <div className="hidden grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto] gap-4 border-b border-white/5 px-6 py-3 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500 md:grid">
                <div>Agent</div>
                <div>Ceiling</div>
                <div>Per-match</div>
                <div>Remaining</div>
                <div>Status</div>
                <div className="text-right">Actions</div>
              </div>
              {ALLOCATIONS.map((a) => (
                <AllocationRow key={a.id} allocation={a} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionHeader
            eyebrow="Bookie · positions"
            title="Open and settled"
            action={
              <Link href="/agents/bookie" className="font-mono text-[11px] uppercase tracking-[0.22em] text-violet-200 hover:text-violet-100">
                view agent →
              </Link>
            }
          />
          <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B0E]">
            {POSITIONS.map((p, i) => (
              <div
                key={p.id}
                className={cn(
                  "grid grid-cols-[1.4fr_auto_auto] items-center gap-4 px-5 py-4",
                  i < POSITIONS.length - 1 && "border-b border-white/[0.04]",
                )}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.22em]",
                        p.status === "open"
                          ? "border-amber-500/30 bg-amber-500/[0.06] text-amber-200"
                          : p.status === "won"
                          ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-200"
                          : "border-red-500/30 bg-red-500/[0.06] text-red-200",
                      )}
                    >
                      {p.status.toUpperCase()}
                    </span>
                    <p className="truncate text-sm text-zinc-100">{p.market}</p>
                  </div>
                  <p className="mt-1 font-mono text-[11px] text-zinc-500">
                    {p.matchLabel} · {p.side} · {timeAgo(p.openedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm text-zinc-200">
                    {formatUsdt(p.stakeUsdt)}
                  </p>
                  {p.settledPnlUsdt !== undefined ? (
                    <p
                      className={cn(
                        "font-mono text-[11px]",
                        p.settledPnlUsdt >= 0 ? "text-emerald-300" : "text-red-300",
                      )}
                    >
                      {p.settledPnlUsdt > 0 ? "+" : ""}
                      {formatUsdt(p.settledPnlUsdt)}
                    </p>
                  ) : (
                    <p className="font-mono text-[11px] text-zinc-500">live</p>
                  )}
                </div>
                <TxLink hash={p.txHash} chars={4} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionHeader eyebrow="Scout · vault" title="Your moments" />
          <div className="mt-6 grid grid-cols-2 gap-3">
            {myMints.map((mint) => (
              <Link
                key={mint.id}
                href={`/activity?match=${mint.matchId}`}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0E]"
              >
                <div className={cn("aspect-square p-4 text-zinc-900", mint.imageGradient)}>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em]">
                    #{mint.tokenId}
                  </span>
                </div>
                <div className="p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    {mint.matchLabel} · {mint.minute}&apos;
                  </p>
                  <p className="mt-0.5 truncate text-[12px] text-zinc-200">{mint.moment}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-12">
        <SectionHeader eyebrow="Manager · last roster" title={`Matchday ${ROSTERS[0].matchday} · ${ROSTERS[0].profile}`} />
        <div className="mt-6 rounded-3xl border border-white/10 bg-[#0B0B0E] p-6">
          <div className="grid grid-cols-4 gap-3 md:grid-cols-6 lg:grid-cols-11">
            {ROSTERS[0].slots.map((slot) => (
              <div
                key={`${slot.nation}-${slot.jersey}`}
                className="flex flex-col items-center gap-1 rounded-xl border border-white/[0.06] bg-[#111113] p-3 text-center"
              >
                <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-zinc-500">
                  {slot.position}
                </span>
                <span className="font-mono text-sm text-zinc-100">{slot.nation}</span>
                <span className="font-mono text-[11px] text-violet-200">#{slot.jersey}</span>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-5">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              Projected points · {ROSTERS[0].pointsProjected}
            </p>
            <TxLink hash={ROSTERS[0].txHash} chars={6} />
          </div>
        </div>
      </section>

      <section className="mt-12 mb-20">
        <SectionHeader
          eyebrow="Recent decisions"
          title="What your agents did last"
          action={
            <Link href="/activity" className="font-mono text-[11px] uppercase tracking-[0.22em] text-violet-200 hover:text-violet-100">
              full ledger →
            </Link>
          }
        />
        <div className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B0E]">
          {myActivity.map((item, i) => (
            <ActivityRow key={item.id} item={item} index={i} />
          ))}
        </div>
      </section>
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  action,
}: {
  eyebrow: string;
  title: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
          {eyebrow}
        </span>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-zinc-100 md:text-2xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

function AllocationRow({ allocation }: { allocation: Allocation }) {
  const agent = AGENTS[allocation.agent];
  const isActive = allocation.status === "active";
  const usedPct =
    ((allocation.ceilingUsdt - allocation.remainingUsdt) / allocation.ceilingUsdt) * 100;

  return (
    <div className="grid items-center gap-3 border-b border-white/[0.04] px-6 py-4 last:border-b-0 md:grid-cols-[1.2fr_1fr_1fr_1fr_1fr_auto]">
      <div className="flex items-center gap-3">
        <AgentAvatar agent={allocation.agent} size={36} />
        <div>
          <p className="text-sm text-zinc-100">{agent.name}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
            {agent.glyph} · created {timeAgo(allocation.createdAt)}
          </p>
        </div>
      </div>
      <div className="font-mono text-sm text-zinc-200 tabular-nums">
        {formatUsdt(allocation.ceilingUsdt, { compact: true })}
      </div>
      <div className="font-mono text-sm text-zinc-200 tabular-nums">
        {formatUsdt(allocation.perMatchCapUsdt)}
      </div>
      <div className="space-y-1">
        <p className="font-mono text-sm text-zinc-200 tabular-nums">
          {formatUsdt(allocation.remainingUsdt)}
        </p>
        <div className="h-1 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-violet-400"
            style={{ width: `${Math.min(usedPct, 100)}%` }}
          />
        </div>
      </div>
      <div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em]",
            isActive
              ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-200"
              : "border-zinc-600/40 bg-zinc-600/[0.06] text-zinc-400",
          )}
        >
          <span
            className={cn(
              "size-1 rounded-full",
              isActive ? "bg-emerald-400" : "bg-zinc-500",
            )}
          />
          {allocation.status}
        </span>
      </div>
      <div className="flex items-center gap-1.5 md:justify-end">
        <Button variant="ghost" size="sm">
          <Key01Icon size={12} />
          Top up
        </Button>
        <Button variant="ghost" size="sm" className="text-red-300 hover:text-red-200">
          Revoke
        </Button>
      </div>
    </div>
  );
}

