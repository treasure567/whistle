"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import {
  AddCircleIcon,
  FootballIcon,
  StarIcon,
  UserGroupIcon,
  WalletAdd01Icon,
} from "hugeicons-react";
import { useAccount } from "wagmi";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/ui/connect-button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatBlock } from "@/components/ui/stat-block";
import { TxLink } from "@/components/ui/tx-link";
import { useMyTeam } from "@/hooks/use-my-team";
import { useOnchainAllocations } from "@/hooks/use-onchain-allocations";
import { fetchPredictions } from "@/lib/api/predictions";
import type { FantasyTeamRecord, PredictionRecord } from "@/lib/api/schemas";
import { AGENTS } from "@/lib/mock";
import { formatPercent, formatUsdt, timeAgo, truncateAddress } from "@/lib/format";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 280, damping: 30 };

export function DashboardShell() {
  const { isConnected, address } = useAccount();
  const { allocations, totalFunded, fundedCount } = useOnchainAllocations();
  const { team } = useMyTeam();
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!address) {
        if (active) setPredictions([]);
        return;
      }
      const rows = await fetchPredictions(address);
      if (active) setPredictions(rows);
    }
    void load();
    return () => {
      active = false;
    };
  }, [address]);

  if (!isConnected || !address) {
    return (
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <div className="rounded-3xl border border-border bg-card p-10 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full border border-violet-500/30 bg-violet-500/[0.06] text-violet-200">
            <WalletAdd01Icon size={20} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
            Connect your wallet
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
            Your on-chain funding, calls, and saved squad show up here once you connect.
          </p>
          <div className="mt-6 flex justify-center">
            <ConnectButton />
          </div>
        </div>
      </div>
    );
  }

  const won = predictions.filter((p) => p.status === "WON").length;
  const lost = predictions.filter((p) => p.status === "LOST").length;
  const winRate = won + lost > 0 ? (won / (won + lost)) * 100 : 0;

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
            Dashboard
          </span>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Your dashboard
          </h1>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
            {truncateAddress(address, 6)} · X Layer
          </p>
        </div>
        <Link href="/allocate">
          <Button variant="violet" size="pill">
            New funding
            <AddCircleIcon size={14} />
          </Button>
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="mt-10 grid gap-4 rounded-3xl border border-border bg-card p-6 md:grid-cols-4"
      >
        <StatBlock
          label="Money funded"
          value={formatUsdt(totalFunded, { compact: true })}
          hint={`${fundedCount} agent${fundedCount === 1 ? "" : "s"} funded`}
        />
        <StatBlock label="Agents backed" value={`${fundedCount} / 3`} hint="Emma · Jack · Tom" />
        <StatBlock
          label="Calls made"
          value={predictions.length.toString()}
          hint={`${won}W / ${lost}L`}
        />
        <StatBlock
          label="Call win rate"
          value={formatPercent(winRate, 0)}
          hint={`${predictions.filter((p) => p.status === "OPEN").length} open`}
        />
      </motion.div>

      <section id="sessions" className="mt-12">
        <SectionHeader
          eyebrow="On-chain funding"
          title="Who you're backing"
          action={
            <Link href="/allocate" className="font-mono text-[11px] uppercase tracking-[0.22em] text-violet-500 hover:text-violet-400 dark:text-violet-200 dark:hover:text-violet-100">
              + fund someone
            </Link>
          }
        />
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {allocations.map((a) => {
            const agent = AGENTS[a.slug];
            const funded = a.fundedUsdt > 0;
            return (
              <div key={a.slug} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
                <div className="flex items-center gap-3">
                  <AgentAvatar agent={a.slug} size={40} />
                  <div>
                    <p className="text-sm font-semibold text-foreground">{agent.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      {agent.role}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "ml-auto inline-flex items-center gap-1.5 rounded-sm border px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em]",
                      funded
                        ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    <span className={cn("size-1 rounded-full", funded ? "bg-emerald-400" : "bg-zinc-500")} />
                    {funded ? "funded" : "idle"}
                  </span>
                </div>
                <div className="flex items-end justify-between border-t border-border pt-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                      Allocated
                    </p>
                    <p className="mt-1 font-mono text-lg tabular-nums text-foreground">
                      {formatUsdt(a.fundedUsdt)}
                    </p>
                  </div>
                  <Link href={`/allocate?agent=${a.slug}`}>
                    <Button variant="outline" size="sm">
                      {funded ? "Top up" : "Fund"}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <SectionHeader
            eyebrow={`${AGENTS.bookie.name} · your calls`}
            title="Predictions"
            action={
              <Link href="/play/predict" className="font-mono text-[11px] uppercase tracking-[0.22em] text-violet-500 hover:text-violet-400 dark:text-violet-200 dark:hover:text-violet-100">
                make a call →
              </Link>
            }
          />
          <div className="mt-6 overflow-hidden rounded-3xl border border-border bg-card">
            {predictions.length === 0 ? (
              <EmptyState
                icon={<FootballIcon size={16} />}
                label="NO_CALLS_YET"
                hint="Head to Play and lock in your first match call."
                className="border-0 rounded-none"
              />
            ) : (
              predictions.slice(0, 8).map((p, i) => <CallRow key={p.id} prediction={p} last={i === Math.min(predictions.length, 8) - 1} />)
            )}
          </div>
        </div>

        <div>
          <SectionHeader
            eyebrow={`${AGENTS.manager.name} · your squad`}
            title="Saved team"
            action={
              <Link href="/play/team" className="font-mono text-[11px] uppercase tracking-[0.22em] text-violet-500 hover:text-violet-400 dark:text-violet-200 dark:hover:text-violet-100">
                edit →
              </Link>
            }
          />
          <div className="mt-6 rounded-3xl border border-border bg-card p-6">
            {team ? <TeamSummary team={team} /> : (
              <EmptyState
                icon={<UserGroupIcon size={16} />}
                label="NO_SQUAD_YET"
                hint="Let Tom draft your 15 in Play → Pick your players."
                className="border-0 rounded-none"
                action={
                  <Link href="/play/team">
                    <Button variant="violet" size="sm">Build a squad</Button>
                  </Link>
                }
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function CallRow({ prediction, last }: { prediction: PredictionRecord; last: boolean }) {
  const tone =
    prediction.status === "WON"
      ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-300"
      : prediction.status === "LOST"
        ? "border-red-500/30 bg-red-500/[0.06] text-red-300"
        : "border-amber-500/30 bg-amber-500/[0.06] text-amber-200";
  return (
    <div className={cn("flex items-center justify-between gap-3 px-5 py-4", !last && "border-b border-border")}>
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn("inline-flex items-center rounded-sm border px-1.5 py-0.5 font-mono text-[9px] tracking-[0.22em]", tone)}>
            {prediction.status}
          </span>
          <p className="truncate text-sm text-foreground">{prediction.market}</p>
        </div>
        <p className="mt-1 font-mono text-[11px] text-muted-foreground">
          {prediction.side} · {prediction.stakeUsdt > 0 ? `${prediction.stakeUsdt} OKB` : "free"} · {timeAgo(Date.parse(prediction.createdAt))}
        </p>
      </div>
      {prediction.txHash ? <TxLink hash={prediction.txHash} chars={4} /> : null}
    </div>
  );
}

function TeamSummary({ team }: { team: FantasyTeamRecord }) {
  const starters = team.picks.filter((p) => p.starter);
  const captain = team.picks.find((p) => p.captain)?.player;
  const cost = team.picks.reduce((sum, p) => sum + Number(p.player.priceMillions), 0);
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-base font-semibold tracking-tight text-foreground">{team.name}</p>
          <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            {team.formation} · {cost.toFixed(1)}m
          </p>
        </div>
        {captain ? (
          <span className="inline-flex items-center gap-1 rounded-full border border-violet-400/40 bg-violet-500/[0.08] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-violet-200">
            <StarIcon size={11} /> {captain.name}
          </span>
        ) : null}
      </div>
      <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-6">
        {starters.map((pick) => (
          <div
            key={pick.player.id}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border bg-foreground/[0.02] p-2.5 text-center",
              pick.captain ? "border-violet-400/40" : "border-border",
            )}
          >
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
              {pick.player.position}
            </span>
            <span className="font-mono text-[12px] text-foreground">{pick.player.teamCode}</span>
            <span className="font-mono text-[10px] text-violet-300">{Number(pick.player.priceMillions).toFixed(1)}</span>
          </div>
        ))}
      </div>
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
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
          {eyebrow}
        </span>
        <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}
