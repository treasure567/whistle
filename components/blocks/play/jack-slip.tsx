"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import {
  CheckmarkCircle02Icon,
  Loading03Icon,
  MagicWand01Icon,
  ShieldBlockchainIcon,
  SparklesIcon,
} from "hugeicons-react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/ui/connect-button";
import { TxLink } from "@/components/ui/tx-link";
import { ApiError } from "@/lib/api/client";
import { buildSlip, createPrediction } from "@/lib/api/predictions";
import type { PredictionRecord, Slip, SlipPick } from "@/lib/api/schemas";
import { useFundAgent, phaseLabel } from "@/hooks/use-fund-agent";
import { teamName } from "@/lib/wc-teams";
import { formatUsdt } from "@/lib/format";
import { cn } from "@/lib/utils";

const RISKS = [
  { id: "safe", label: "Safe" },
  { id: "balanced", label: "Balanced" },
  { id: "aggressive", label: "Aggressive" },
] as const;

type Risk = (typeof RISKS)[number]["id"];

function displaySide(pick: SlipPick): string {
  if (pick.side === pick.homeCode) return teamName(pick.homeCode);
  if (pick.side === pick.awayCode) return teamName(pick.awayCode);
  return pick.side;
}

export function JackSlip({ onBooked }: { onBooked: (created: PredictionRecord[]) => void }) {
  const { address, isConnected } = useAccount();
  const { state: fundState, fund, reset: resetFund } = useFundAgent();
  const [budget, setBudget] = useState(50);
  const [preferences, setPreferences] = useState("");
  const [risk, setRisk] = useState<Risk>("balanced");
  const [slip, setSlip] = useState<Slip | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [building, setBuilding] = useState(false);
  const [savingBook, setSavingBook] = useState(false);
  const [booked, setBooked] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fundBusy =
    fundState.phase === "checking" ||
    fundState.phase === "minting" ||
    fundState.phase === "approving" ||
    fundState.phase === "allocating";
  const booking = fundBusy || savingBook;

  const selectedPicks = slip ? slip.picks.filter((_, i) => selected.has(i)) : [];
  const totalStake = selectedPicks.reduce((sum, p) => sum + p.stake, 0);

  async function ask() {
    setError(null);
    setBuilding(true);
    setBooked(null);
    try {
      const result = await buildSlip({
        budget,
        risk,
        ...(preferences.trim() ? { preferences: preferences.trim() } : {}),
      });
      setSlip(result);
      setSelected(new Set(result.picks.map((_, i) => i)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Jack couldn't build a slip. Try again.");
    } finally {
      setBuilding(false);
    }
  }

  function toggle(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  async function book() {
    if (!address || selectedPicks.length === 0) return;
    setError(null);
    const txHash = await fund("bookie", totalStake);
    if (!txHash) return;
    setSavingBook(true);
    try {
      const created: PredictionRecord[] = [];
      for (const pick of selectedPicks) {
        const record = await createPrediction({
          ownerAddress: address,
          matchExternalId: pick.matchExternalId,
          market: pick.market,
          side: displaySide(pick),
          stakeUsdt: String(pick.stake),
          txHash,
        });
        created.push(record);
      }
      onBooked(created);
      setBooked(created.length);
      setSlip(null);
      resetFund();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Funded, but saving the slip failed.");
    } finally {
      setSavingBook(false);
    }
  }

  function startOver() {
    setSlip(null);
    setBooked(null);
    setError(null);
    resetFund();
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">
        <AgentAvatar agent="bookie" size={40} ring />
        <div>
          <p className="text-sm font-semibold text-foreground">Let Jack build your slip</p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-200/80">
            Set a budget, he sources the matches
          </p>
        </div>
      </div>

      {booked !== null ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4">
            <CheckmarkCircle02Icon size={18} className="text-emerald-600 dark:text-emerald-300" />
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">Jack booked your slip</p>
              <p className="mt-0.5 text-sm text-emerald-700 dark:text-emerald-100">
                {booked} call{booked === 1 ? "" : "s"} placed and funded onchain.
              </p>
            </div>
            {fundState.txHash ? <TxLink hash={fundState.txHash} chars={5} className="ml-auto" /> : null}
          </div>
          <Button variant="outline" size="sm" onClick={startOver}>
            Build another slip
          </Button>
        </div>
      ) : !slip ? (
        <>
          <Field label={`Budget · ${formatUsdt(budget)}`}>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={5}
                max={500}
                step={5}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="flex-1 accent-violet-500"
                aria-label="Budget"
              />
              <input
                type="number"
                min={5}
                max={1000}
                value={budget}
                onChange={(e) => setBudget(Math.max(5, Number(e.target.value)))}
                className="w-20 rounded-lg border border-border bg-muted px-2 py-1 text-right font-mono text-sm text-foreground outline-none"
              />
            </div>
          </Field>

          <Field label="Risk">
            <div className="flex flex-wrap gap-1.5">
              {RISKS.map((r) => (
                <Chip key={r.id} active={risk === r.id} onClick={() => setRisk(r.id)} label={r.label} />
              ))}
            </div>
          </Field>

          <Field label="What are you looking for? (optional)">
            <input
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              placeholder="e.g. back the favourites, lots of goals, avoid draws"
              maxLength={280}
              className="h-11 w-full rounded-xl border border-border bg-muted px-4 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-violet-400/50"
            />
          </Field>

          {error ? (
            <p className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-[12px] text-red-600 dark:text-red-300">{error}</p>
          ) : null}

          <Button variant="violet" size="lg" onClick={ask} disabled={building}>
            {building ? <Loading03Icon size={14} className="animate-spin" /> : <MagicWand01Icon size={14} />}
            {building ? "Jack is sourcing matches..." : "Ask Jack to build my slip"}
          </Button>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Jack&apos;s slip · {slip.picks.length} picks
            </p>
            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">
              <SparklesIcon size={11} />
              {slip.source === "llm" ? "Live AI" : "Model"}
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {slip.picks.map((pick, i) => (
              <button
                key={`${pick.matchExternalId}-${i}`}
                type="button"
                onClick={() => toggle(i)}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-colors",
                  selected.has(i) ? "border-violet-400/40 bg-violet-500/[0.05]" : "border-border opacity-60",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 shrink-0 items-center justify-center rounded-md border",
                    selected.has(i) ? "border-violet-400 bg-violet-500 text-white" : "border-border text-transparent",
                  )}
                >
                  <CheckmarkCircle02Icon size={12} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground">
                    {teamName(pick.homeCode)} <span className="text-muted-foreground">v</span> {teamName(pick.awayCode)}
                  </p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {pick.market} · <span className="text-violet-500 dark:text-violet-300">{displaySide(pick)}</span>
                  </p>
                  {pick.note ? <p className="mt-0.5 truncate text-[11px] font-serif-italic text-muted-foreground">{pick.note}</p> : null}
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm tabular-nums text-foreground">{pick.stake} OKB</p>
                  <Confidence value={pick.confidence} />
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Total stake</span>
            <span className={cn("font-mono text-sm tabular-nums", totalStake > slip.budget ? "text-red-600 dark:text-red-300" : "text-foreground")}>
              {formatUsdt(totalStake)} / {formatUsdt(slip.budget)}
            </span>
          </div>

          {fundBusy ? (
            <div className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-3 text-[12px] text-violet-700 dark:text-violet-100">
              <Loading03Icon size={14} className="animate-spin" />
              {phaseLabel(fundState.phase)}… confirm in your wallet
            </div>
          ) : null}
          {error || (fundState.phase === "error" && fundState.error) ? (
            <p className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-[12px] text-red-600 dark:text-red-300">
              {error ?? fundState.error}
            </p>
          ) : null}

          <p className="flex items-center gap-1.5 text-[11px] text-amber-200/80">
            <ShieldBlockchainIcon size={12} />
            One signature funds Jack with {formatUsdt(totalStake)}, then he books every pick.
          </p>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={startOver} disabled={booking}>
              Start over
            </Button>
            {isConnected ? (
              <Button variant="violet" size="lg" onClick={book} disabled={booking || selectedPicks.length === 0} className="flex-1">
                {booking ? <Loading03Icon size={14} className="animate-spin" /> : null}
                {booking ? phaseLabel(fundState.phase) : `Approve & let Jack book (${selectedPicks.length})`}
              </Button>
            ) : (
              <ConnectButton />
            )}
          </div>
        </>
      )}
    </div>
  );
}

function Confidence({ value }: { value: number }) {
  return (
    <div className="mt-1 flex items-center justify-end gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={cn("size-1.5 rounded-full", n <= value ? "bg-amber-400" : "bg-foreground/15")} />
      ))}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1.5 text-[12px] transition-colors",
        active
          ? "border-violet-400/50 bg-violet-500/[0.08] text-violet-700 dark:text-violet-100"
          : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}
