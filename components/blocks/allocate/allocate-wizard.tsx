"use client";

import { useMemo, useState } from "react";
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
import type { Hex } from "viem";

const STEP_LABELS = ["Agent", "Limits", "Session", "Confirm"] as const;
type StepIndex = 0 | 1 | 2 | 3;

interface AllocateWizardProps {
  initialAgent?: AgentSlug;
}

function mockTxHash(seed: string): Hex {
  const hex = Array.from(seed)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("")
    .padEnd(64, "f");
  return `0x${hex.slice(0, 64)}` as Hex;
}

const HOURS_OPTIONS = [
  { label: "6 h", value: 6 },
  { label: "24 h", value: 24 },
  { label: "3 d", value: 72 },
  { label: "Full tournament", value: 24 * 30 },
] as const;

export function AllocateWizard({ initialAgent }: AllocateWizardProps) {
  const { isConnected, address } = useAccount();
  const [step, setStep] = useState<StepIndex>(0);
  const [agentSlug, setAgentSlug] = useState<AgentSlug>(initialAgent ?? "bookie");
  const [ceiling, setCeiling] = useState(500);
  const [perMatch, setPerMatch] = useState(100);
  const [hours, setHours] = useState<number>(24);
  const [confirmed, setConfirmed] = useState(false);

  const agent = AGENTS[agentSlug];
  const finalTxHash = useMemo(
    () => mockTxHash(`alloc-${agentSlug}-${ceiling}-${perMatch}-${hours}`),
    [agentSlug, ceiling, perMatch, hours],
  );

  function next() {
    setStep((s) => Math.min(3, s + 1) as StepIndex);
  }
  function back() {
    setStep((s) => Math.max(0, s - 1) as StepIndex);
  }
  function reset() {
    setConfirmed(false);
    setStep(0);
  }

  return (
    <div className="relative mx-auto max-w-5xl px-6 md:px-10">
      <Stepper step={step} confirmed={confirmed} />

      <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B0E]">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <StepShell key="step-0" title="Choose an agent" subtitle="Each agent has its own personality and capital model.">
              <AgentPicker selected={agentSlug} onSelect={setAgentSlug} />
            </StepShell>
          ) : null}

          {step === 1 ? (
            <StepShell key="step-1" title="Set capital limits" subtitle={`Cap how much ${agent.name} can deploy.`}>
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
              title="Session key duration"
              subtitle="A scoped key signs on your behalf. Revocable any time."
            >
              <SessionForm hours={hours} onHoursChange={setHours} />
            </StepShell>
          ) : null}

          {step === 3 ? (
            <StepShell
              key="step-3"
              title={confirmed ? "Session active" : "Review and sign"}
              subtitle={
                confirmed
                  ? `${agent.name} can now act under the limits you set.`
                  : "One signature creates the session key. xdev never custodies funds."
              }
            >
              {confirmed ? (
                <Confirmed
                  agent={agent}
                  ceiling={ceiling}
                  perMatch={perMatch}
                  hours={hours}
                  txHash={finalTxHash}
                />
              ) : (
                <ReviewForm
                  agent={agent}
                  ceiling={ceiling}
                  perMatch={perMatch}
                  hours={hours}
                />
              )}
            </StepShell>
          ) : null}
        </AnimatePresence>

        <div className="flex items-center justify-between gap-3 border-t border-white/5 bg-[#0E0E12] px-6 py-4">
          {confirmed ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Open dashboard
                </Button>
              </Link>
              <Button variant="violet" size="sm" onClick={reset}>
                Allocate another
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
                    onClick={() => setConfirmed(true)}
                  >
                    Sign and create session
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
        <div className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4 text-[12px] text-amber-100">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber-300">
            Not connected
          </p>
          <p className="mt-1.5">
            You can walk through the flow now, but signing the session key
            requires a wallet on X Layer.
          </p>
        </div>
      ) : (
        <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Allocating from {truncateAddress(address ?? "")}
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
                  ? "border-emerald-500/30 bg-emerald-500/[0.06] text-emerald-200"
                  : isActive
                  ? "border-violet-500/40 bg-violet-500/[0.08] text-violet-100"
                  : "border-white/10 bg-transparent text-zinc-500",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  isPast ? "bg-emerald-400" : isActive ? "bg-violet-400" : "bg-zinc-600",
                )}
              />
              {label}
            </span>
            {i < STEP_LABELS.length - 1 ? (
              <span aria-hidden className="h-px w-6 bg-white/10" />
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
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">{title}</h2>
      <p className="mt-1.5 text-sm text-zinc-400">{subtitle}</p>
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
              "group flex flex-col gap-4 rounded-2xl border bg-[#0E0E12] p-5 text-left transition-all",
              isSel
                ? "border-violet-400/50"
                : "border-white/10 hover:border-white/25",
            )}
          >
            <div className="flex items-center gap-3">
              <AgentAvatar agent={agent.slug} size={40} />
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  {agent.glyph}
                </p>
                <p className="text-sm font-semibold text-zinc-100">{agent.name}</p>
              </div>
              {isSel ? (
                <span className="ml-auto inline-flex size-6 items-center justify-center rounded-full border border-violet-400/50 bg-violet-500/10 text-violet-200">
                  <Tick02Icon size={12} />
                </span>
              ) : null}
            </div>
            <p className="text-[12px] leading-relaxed text-zinc-400">{agent.tagline}</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
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
        label="Session ceiling"
        hint="Total USDT the agent can deploy across this session."
        value={ceiling}
        onChange={onCeilingChange}
        suggestions={[250, 500, 1500, 5000]}
      />
      <LimitField
        label="Per-match cap"
        hint="Cap on a single match decision. Always ≤ ceiling."
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
    <div className="rounded-2xl border border-white/10 bg-[#0E0E12] p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">{label}</p>
      <div className="mt-3 flex items-baseline gap-2">
        <input
          type="number"
          min={1}
          value={value}
          onChange={(e) => onChange(Math.max(1, Number(e.target.value)))}
          className="w-32 bg-transparent font-mono text-3xl tabular-nums tracking-tight text-zinc-100 outline-none"
        />
        <span className="font-mono text-sm text-zinc-500">USDT</span>
      </div>
      <p className="mt-2 text-[12px] text-zinc-500">{hint}</p>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChange(s)}
            className={cn(
              "rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors",
              value === s
                ? "border-violet-400/50 bg-violet-500/[0.08] text-violet-100"
                : "border-white/10 bg-transparent text-zinc-400 hover:border-white/25 hover:text-zinc-100",
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
    <div className="rounded-2xl border border-white/10 bg-[#0E0E12] p-6">
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
                  : "border-white/10 bg-transparent hover:border-white/25",
              )}
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Window
              </span>
              <span className="font-mono text-lg text-zinc-100">{opt.label}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-6 rounded-xl border border-white/5 bg-[#08080A] p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Session expires
        </p>
        <p className="mt-1 font-mono text-base text-zinc-200">
          in {hours < 24 ? `${hours} hours` : `${Math.round(hours / 24)} days`}
        </p>
        <p className="mt-2 text-[12px] text-zinc-500">
          The session key auto-expires onchain. You can revoke it earlier
          from the dashboard.
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
    { label: "Agent", value: `${agent.name} · ${agent.glyph}` },
    { label: "Session ceiling", value: formatUsdt(ceiling) },
    { label: "Per-match cap", value: formatUsdt(perMatch) },
    { label: "Session duration", value: `${hours} hours` },
    { label: "Chain", value: "X Layer · chainId 196" },
    { label: "Contract", value: "PositionManager.sol" },
  ];
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-[#0E0E12]">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={cn(
              "grid grid-cols-[160px_1fr] items-center gap-4 px-5 py-4",
              i < rows.length - 1 && "border-b border-white/[0.04]",
            )}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              {row.label}
            </span>
            <span className="font-mono text-sm text-zinc-200">{row.value}</span>
          </div>
        ))}
      </div>

      <ul className="space-y-2 rounded-2xl border border-white/5 bg-[#08080A] p-5 text-[12px] text-zinc-400">
        <li className="flex gap-2">
          <ShieldBlockchainIcon size={14} className="mt-0.5 text-violet-300" />
          xdev never custodies funds. Capital sits in PositionManager.sol.
        </li>
        <li className="flex gap-2">
          <Key01Icon size={14} className="mt-0.5 text-violet-300" />
          The session key is scoped — it cannot exceed the limits above.
        </li>
        <li className="flex gap-2">
          <Wallet01Icon size={14} className="mt-0.5 text-violet-300" />
          One signature creates the session. No further pop-ups per match.
        </li>
      </ul>
    </div>
  );
}

function Confirmed({
  agent,
  ceiling,
  perMatch,
  hours,
  txHash,
}: {
  agent: Agent;
  ceiling: number;
  perMatch: number;
  hours: number;
  txHash: Hex;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5">
        <span className="inline-flex size-9 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/[0.08] text-emerald-200">
          <Tick02Icon size={14} />
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-300">
            Session created
          </p>
          <p className="mt-0.5 text-sm text-emerald-100">
            {agent.name} is now active under your limits.
          </p>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <ReceiptRow label="Session ceiling" value={formatUsdt(ceiling)} />
        <ReceiptRow label="Per-match cap" value={formatUsdt(perMatch)} />
        <ReceiptRow label="Window" value={`${hours} hours`} />
        <ReceiptRow label="Tx" value={<TxLink hash={txHash} chars={6} />} />
      </div>
    </div>
  );
}

function ReceiptRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-[#0E0E12] px-4 py-3">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </span>
      <span className="font-mono text-sm text-zinc-200">{value}</span>
    </div>
  );
}
