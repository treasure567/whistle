"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Tick02Icon,
  Wallet01Icon,
  Key01Icon,
  ShieldBlockchainIcon,
} from "hugeicons-react";
import { useAccount } from "wagmi";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/ui/connect-button";
import { TxLink } from "@/components/ui/tx-link";
import type { Agent, AgentSlug } from "@/types";
import { AGENT_LIST, AGENTS } from "@/lib/mock";
import { formatUsdt, truncateAddress } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useFundAgent, phaseLabel, type FundState, type FundPhase } from "@/hooks/use-fund-agent";

const STEP_LABELS = ["Person", "Limits", "Duration", "Confirm"] as const;
type StepIndex = 0 | 1 | 2 | 3;

interface AllocateWizardProps {
  initialAgent?: AgentSlug;
}

const HOURS_OPTIONS = [
  { label: "6 h", value: 6 },
  { label: "24 h", value: 24 },
  { label: "3 d", value: 72 },
  { label: "Full tournament", value: 24 * 30 },
] as const;

export function AllocateWizard({ initialAgent }: AllocateWizardProps) {
  const { isConnected, address } = useAccount();
  const { state, fund, reset: resetFund } = useFundAgent();
  const [step, setStep] = useState<StepIndex>(0);
  const [agentSlug, setAgentSlug] = useState<AgentSlug>(initialAgent ?? "bookie");
  const [ceiling, setCeiling] = useState(500);
  const [perMatch, setPerMatch] = useState(100);
  const [hours, setHours] = useState<number>(24);

  const agent = AGENTS[agentSlug];
  const confirmed = state.phase === "success";
  const busy =
    state.phase === "checking" ||
    state.phase === "minting" ||
    state.phase === "approving" ||
    state.phase === "allocating";

  function next() {
    setStep((s) => Math.min(3, s + 1) as StepIndex);
  }
  function back() {
    setStep((s) => Math.max(0, s - 1) as StepIndex);
  }
  function reset() {
    resetFund();
    setStep(0);
  }

  return (
    <div className="relative mx-auto max-w-5xl px-6 md:px-10">
      <Stepper step={step} confirmed={confirmed} />

      <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <StepShell key="step-0" title="Pick Emma, Jack, or Tom" subtitle="Each one does a different job during the match.">
              <AgentPicker selected={agentSlug} onSelect={setAgentSlug} />
            </StepShell>
          ) : null}

          {step === 1 ? (
            <StepShell key="step-1" title="Set spending limits" subtitle={`Choose how much ${agent.name} can spend.`}>
              <LimitsForm
                ceiling={ceiling}
                perMatch={perMatch}
                onCeilingChange={setCeiling}
                onPerMatchChange={setPerMatch}
              />
            </StepShell>
          ) : null}

          {step === 2 ? (
            <StepShell
              key="step-2"
              title="How long should this last?"
              subtitle="You can cancel early anytime from your dashboard."
            >
              <SessionForm hours={hours} onHoursChange={setHours} />
            </StepShell>
          ) : null}

          {step === 3 ? (
            <StepShell
              key="step-3"
              title={confirmed ? "You're all set" : "Review and confirm"}
              subtitle={
                confirmed
                  ? `${agent.name} can now work within the limits you set.`
                  : busy
                    ? "Confirm in your wallet — funds move onchain."
                    : `One signature funds ${agent.name} with ${formatUsdt(ceiling)} onchain.`
              }
            >
              {confirmed ? (
                <Confirmed
                  agent={agent}
                  ceiling={ceiling}
                  perMatch={perMatch}
                  hours={hours}
                  state={state}
                />
              ) : (
                <>
                  <ReviewForm agent={agent} ceiling={ceiling} perMatch={perMatch} hours={hours} />
                  {busy ? <TxProgress state={state} /> : null}
                  {state.phase === "error" && state.error ? (
                    <p className="mt-4 rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-[12px] text-red-600 dark:text-red-300">
                      {state.error}
                    </p>
                  ) : null}
                </>
              )}
            </StepShell>
          ) : null}
        </AnimatePresence>

        <div className="flex items-center justify-between gap-3 border-t border-border bg-muted px-6 py-4">
          {confirmed ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Open dashboard
                </Button>
              </Link>
              <Button variant="violet" size="sm" onClick={reset}>
                Fund someone else
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={back}
                disabled={step === 0}
                className={cn(step === 0 && "opacity-40")}
              >
                <ArrowLeft01Icon size={14} />
                Back
              </Button>

              <div className="flex items-center gap-3">
                {!isConnected && step === 3 ? (
                  <ConnectButton compact />
                ) : step === 3 ? (
                  <Button
                    variant="violet"
                    size="sm"
                    onClick={() => void fund(agentSlug, ceiling)}
                    disabled={busy}
                  >
                    {busy ? phaseLabel(state.phase) : "Confirm and fund"}
                    <Tick02Icon size={14} />
                  </Button>
                ) : (
                  <Button variant="violet" size="sm" onClick={next}>
                    Continue
                    <ArrowRight01Icon size={14} />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {!isConnected ? (
        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4 text-[12px] text-amber-700 dark:text-amber-100">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-600 dark:text-amber-300">
            Not connected
          </p>
          <p className="mt-1.5">
            You can try the steps now, but confirming requires a connected wallet.
          </p>
        </div>
      ) : (
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Funding from {truncateAddress(address ?? "")}
        </p>
      )}
    </div>
  );
}

function Stepper({ step, confirmed }: { step: StepIndex; confirmed: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {STEP_LABELS.map((label, i) => {
        const isPast = i < step || (confirmed && i <= step);
        const isActive = i === step && !confirmed;
        return (
          <div key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-7 items-center gap-2 rounded-full border px-3 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors",
                isPast
                  ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-600 dark:text-emerald-300"
                  : isActive
                  ? "border-violet-500/40 bg-violet-500/[0.08] text-violet-700 dark:text-violet-100"
                  : "border-border bg-transparent text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isPast ? "bg-emerald-400" : isActive ? "bg-violet-400" : "bg-muted-foreground",
                )}
              />
              {label}
            </span>
            {i < STEP_LABELS.length - 1 ? (
              <span aria-hidden className="h-px w-6 bg-foreground/10" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="px-6 py-8 md:px-10 md:py-10"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h2>
      <p className="mt-1.5 text-sm text-muted-foreground">{subtitle}</p>
      <div className="mt-8">{children}</div>
    </motion.div>
  );
}

function AgentPicker({
  selected,
  onSelect,
}: {
  selected: AgentSlug;
  onSelect: (s: AgentSlug) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {AGENT_LIST.map((agent) => {
        const isSel = agent.slug === selected;
        return (
          <button
            type="button"
            key={agent.slug}
            onClick={() => onSelect(agent.slug)}
            className={cn(
              "group flex flex-col gap-4 rounded-2xl border bg-muted p-5 text-left transition-all",
              isSel
                ? "border-violet-400/50"
                : "border-border hover:border-foreground/30",
            )}
          >
            <div className="flex items-center gap-3">
              <AgentAvatar agent={agent.slug} size={40} />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {agent.glyph}
                </p>
                <p className="text-sm font-semibold text-foreground">{agent.name}</p>
              </div>
              {isSel ? (
                <span className="ml-auto inline-flex size-6 items-center justify-center rounded-full border border-violet-400/50 bg-violet-500/10 text-violet-500 dark:text-violet-200">
                  <Tick02Icon size={12} />
                </span>
              ) : null}
            </div>
            <p className="text-[12px] leading-relaxed text-muted-foreground">{agent.tagline}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
              {agent.tracks.join(" · ")}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function LimitsForm({
  ceiling,
  perMatch,
  onCeilingChange,
  onPerMatchChange,
}: {
  ceiling: number;
  perMatch: number;
  onCeilingChange: (v: number) => void;
  onPerMatchChange: (v: number) => void;
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <LimitField
        label="Total budget"
        hint="The most they can spend across all matches in this period."
        value={ceiling}
        onChange={onCeilingChange}
        suggestions={[250, 500, 1500, 5000]}
      />
      <LimitField
        label="Per-match limit"
        hint="The most they can spend on a single match. Cannot exceed the total budget."
        value={perMatch}
        onChange={(v) => onPerMatchChange(Math.min(v, ceiling))}
        suggestions={[50, 100, 250, 500]}
      />
    </div>
  );
}

function LimitField({
  label,
  hint,
  value,
  onChange,
  suggestions,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  suggestions: number[];
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <input
          type="number"
          min={1}
          value={value}
          onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
          className="w-32 bg-transparent font-mono text-3xl tabular-nums tracking-tight text-foreground outline-none"
        />
        <span className="font-mono text-sm text-muted-foreground">OKB</span>
      </div>
      <p className="mt-2 text-[12px] text-muted-foreground">{hint}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
              value === s
                ? "border-violet-400/50 bg-violet-500/[0.08] text-violet-700 dark:text-violet-100"
                : "border-border bg-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
            )}
          >
            {formatUsdt(s, { compact: true })}
          </button>
        ))}
      </div>
    </div>
  );
}

function SessionForm({
  hours,
  onHoursChange,
}: {
  hours: number;
  onHoursChange: (v: number) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-muted p-6">
      <div className="grid gap-2 md:grid-cols-4">
        {HOURS_OPTIONS.map((opt) => {
          const sel = opt.value === hours;
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => onHoursChange(opt.value)}
              className={cn(
                "flex flex-col items-start gap-1 rounded-xl border p-4 text-left transition-colors",
                sel
                  ? "border-violet-400/50 bg-violet-500/[0.06]"
                  : "border-border bg-transparent hover:border-foreground/30",
              )}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Window
              </span>
              <span className="font-mono text-lg text-foreground">{opt.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-6 rounded-xl border border-border bg-foreground/[0.02] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Session expires
        </p>
        <p className="mt-1 font-mono text-base text-foreground">
          in {hours < 24 ? `${hours} hours` : `${Math.round(hours / 24)} days`}
        </p>
        <p className="mt-2 text-[12px] text-muted-foreground">
          Access expires automatically. You can also cancel early from your dashboard.
        </p>
      </div>
    </div>
  );
}

function ReviewForm({
  agent,
  ceiling,
  perMatch,
  hours,
}: {
  agent: Agent;
  ceiling: number;
  perMatch: number;
  hours: number;
}) {
  const rows = [
    { label: "Person", value: `${agent.name} · ${agent.role}` },
    { label: "Total budget", value: formatUsdt(ceiling) },
    { label: "Per-match limit", value: formatUsdt(perMatch) },
    { label: "Duration", value: `${hours} hours` },
  ];
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-muted">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              "grid grid-cols-[160px_1fr] items-center gap-4 px-5 py-4",
              i < rows.length - 1 && "border-b border-border",
            )}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              {row.label}
            </span>
            <span className="font-mono text-sm text-foreground">{row.value}</span>
          </div>
        ))}
      </div>

      <ul className="space-y-2 rounded-2xl border border-border bg-foreground/[0.02] p-5 text-[12px] text-muted-foreground">
        <li className="flex gap-2">
          <ShieldBlockchainIcon size={14} className="mt-0.5 text-violet-500 dark:text-violet-300" />
          Your money stays in your wallet. Whistle never holds it for you.
        </li>
        <li className="flex gap-2">
          <Key01Icon size={14} className="mt-0.5 text-violet-500 dark:text-violet-300" />
          {agent.name} cannot spend more than the limits you set here.
        </li>
        <li className="flex gap-2">
          <Wallet01Icon size={14} className="mt-0.5 text-violet-500 dark:text-violet-300" />
          One confirmation — no pop-ups during the match.
        </li>
      </ul>
    </div>
  );
}

function TxProgress({ state }: { state: FundState }) {
  const order: FundPhase[] = ["minting", "approving", "allocating"];
  const labels: Record<string, string> = {
    minting: "Mint test OKB",
    approving: "Approve spend",
    allocating: "Fund agent onchain",
  };
  const currentIndex = order.indexOf(state.phase);
  return (
    <div className="mt-6 rounded-2xl border border-violet-500/20 bg-violet-500/[0.04] p-4">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
        {phaseLabel(state.phase)}…
      </p>
      <ul className="mt-3 space-y-2">
        {order.map((phase, i) => {
          const done = currentIndex > i;
          const active = state.phase === phase;
          return (
            <li key={phase} className="flex items-center gap-2.5 text-[12px]">
              <span
                className={cn(
                  "flex size-4 items-center justify-center rounded-full border",
                  done
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300"
                    : active
                      ? "border-violet-400/50 bg-violet-500/10 text-violet-500 dark:text-violet-200"
                      : "border-border text-muted-foreground",
                )}
              >
                {done ? <Tick02Icon size={9} /> : active ? <span className="size-1.5 animate-pulse rounded-full bg-violet-500 dark:bg-violet-300" /> : null}
              </span>
              <span className={cn(done ? "text-muted-foreground" : active ? "text-violet-700 dark:text-violet-100" : "text-muted-foreground")}>
                {labels[phase]}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Confirmed({
  agent,
  ceiling,
  perMatch,
  hours,
  state,
}: {
  agent: Agent;
  ceiling: number;
  perMatch: number;
  hours: number;
  state: FundState;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
        <span className="inline-flex size-9 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-600 dark:text-emerald-300">
          <Tick02Icon size={14} />
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">
            Funding confirmed onchain
          </p>
          <p className="mt-0.5 text-sm text-emerald-700 dark:text-emerald-100">
            {formatUsdt(ceiling)} allocated to {agent.name}. They can now work within your limits.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ReceiptRow label="Allocated" value={formatUsdt(ceiling)} />
        <ReceiptRow label="Per-match limit" value={formatUsdt(perMatch)} />
        <ReceiptRow label="Window" value={`${hours} hours`} />
        <ReceiptRow
          label="Allocate tx"
          value={state.txHash ? <TxLink hash={state.txHash} chars={6} /> : "—"}
        />
        {state.approveHash ? (
          <ReceiptRow label="Approve tx" value={<TxLink hash={state.approveHash} chars={6} />} />
        ) : null}
        {state.mintHash ? (
          <ReceiptRow label="Faucet tx" value={<TxLink hash={state.mintHash} chars={6} />} />
        ) : null}
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-sm text-foreground">{value}</span>
    </div>
  );
}
