"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { CoinsDollarIcon, FootballIcon, Loading03Icon, ShieldBlockchainIcon } from "hugeicons-react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/ui/connect-button";
import { EmptyState } from "@/components/ui/empty-state";
import { TxLink } from "@/components/ui/tx-link";
import { ApiError } from "@/lib/api/client";
import { createPrediction, fetchPredictions } from "@/lib/api/predictions";
import type { PredictionRecord } from "@/lib/api/schemas";
import { AGENTS } from "@/lib/mock";
import { formatUsdt, timeAgo } from "@/lib/format";
import { useFundAgent, phaseLabel } from "@/hooks/use-fund-agent";
import { cn } from "@/lib/utils";
import type { MatchInfo } from "@/types";

type MarketKind = "result" | "yesno" | "teams";
type Side = { id: string; label: string };

const MARKETS: ReadonlyArray<{ id: string; label: string; kind: MarketKind }> = [
  { id: "result", label: "Match result", kind: "result" },
  { id: "btts", label: "Both teams to score", kind: "yesno" },
  { id: "over25", label: "Over 2.5 goals", kind: "yesno" },
  { id: "firstgoal", label: "First team to score", kind: "teams" },
];

const STAKES = [0, 5, 10, 25] as const;

function sidesFor(kind: MarketKind, match: MatchInfo | undefined): Side[] {
  if (kind === "yesno") return [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }];
  const home = match?.home ?? "Home";
  const away = match?.away ?? "Away";
  if (kind === "teams") return [{ id: "home", label: home }, { id: "away", label: away }];
  return [{ id: "home", label: home }, { id: "draw", label: "Draw" }, { id: "away", label: away }];
}

export function PredictView({ matches }: { matches: MatchInfo[] }) {
  const { address, isConnected } = useAccount();
  const { state: fundState, fund, reset: resetFund } = useFundAgent();
  const jack = AGENTS.bookie;
  const [matchId, setMatchId] = useState<string>(matches[0]?.id ?? "");
  const [marketId, setMarketId] = useState<string>(MARKETS[0]!.id);
  const [sideId, setSideId] = useState<string>("home");
  const [stake, setStake] = useState<number>(0);
  const [savingFree, setSavingFree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);

  const match = matches.find((item) => item.id === matchId);
  const market = MARKETS.find((item) => item.id === marketId) ?? MARKETS[0]!;
  const sides = useMemo(() => sidesFor(market.kind, match), [market.kind, match]);

  const fundBusy =
    fundState.phase === "checking" ||
    fundState.phase === "minting" ||
    fundState.phase === "approving" ||
    fundState.phase === "allocating";
  const busy = stake > 0 ? fundBusy : savingFree;

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

  function selectMarket(id: string) {
    setMarketId(id);
    const next = MARKETS.find((item) => item.id === id) ?? MARKETS[0]!;
    setSideId(sidesFor(next.kind, match)[0]!.id);
  }

  async function submit() {
    if (!address || !match) return;
    setError(null);
    const side = sides.find((item) => item.id === sideId) ?? sides[0]!;
    const base = {
      ownerAddress: address,
      matchExternalId: match.id,
      market: market.label,
      side: side.label,
    };
    try {
      if (stake > 0) {
        const txHash = await fund("bookie", stake);
        if (!txHash) return;
        const created = await createPrediction({ ...base, stakeUsdt: String(stake), txHash });
        setPredictions((prev) => [created, ...prev]);
        resetFund();
      } else {
        setSavingFree(true);
        const created = await createPrediction({ ...base, stakeUsdt: "0" });
        setPredictions((prev) => [created, ...prev]);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your prediction");
    } finally {
      setSavingFree(false);
    }
  }

  if (matches.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <EmptyState
          icon={<FootballIcon size={16} />}
          label="NO_MATCHES"
          hint="There are no matches to predict yet. Check back closer to kickoff."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl items-start gap-6 px-6 md:grid-cols-[1.2fr_1fr] md:px-10">
      <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-[#0B0B0E] p-5">
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">
          <AgentAvatar agent="bookie" size={40} />
          <div>
            <p className="text-sm font-semibold text-zinc-100">{jack.name} the Bookie</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-200/80">
              Backs your call onchain
            </p>
          </div>
        </div>

        <Section label="Match">
          <div className="max-h-44 divide-y divide-white/[0.04] overflow-y-auto rounded-xl border border-white/10">
            {matches.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setMatchId(item.id)}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors",
                  matchId === item.id ? "bg-violet-500/[0.06]" : "hover:bg-white/[0.02]",
                )}
              >
                <span className="font-mono text-sm text-zinc-100">
                  {item.home} <span className="text-zinc-600">v</span> {item.away}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
                  {item.phase.replace("-", " ")}
                </span>
              </button>
            ))}
          </div>
        </Section>

        <Section label="Market">
          <div className="flex flex-wrap gap-1.5">
            {MARKETS.map((item) => (
              <Chip key={item.id} active={marketId === item.id} onClick={() => selectMarket(item.id)} label={item.label} />
            ))}
          </div>
        </Section>

        <Section label="Your call">
          <div className="flex flex-wrap gap-1.5">
            {sides.map((side) => (
              <Chip key={side.id} active={sideId === side.id} onClick={() => setSideId(side.id)} label={side.label} />
            ))}
          </div>
        </Section>

        <Section label="Back it">
          <div className="flex flex-wrap gap-1.5">
            {STAKES.map((value) => (
              <Chip
                key={value}
                active={stake === value}
                onClick={() => setStake(value)}
                label={value === 0 ? "Free call" : `${value} USDT`}
              />
            ))}
          </div>
          {stake > 0 ? (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-200/80">
              <ShieldBlockchainIcon size={12} />
              Funds {jack.name} with {formatUsdt(stake)} onchain — one signature.
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-zinc-500">A free call is recorded off-chain. No wallet signature.</p>
          )}
        </Section>

        {fundBusy ? (
          <div className="flex items-center gap-2 rounded-xl border border-violet-500/20 bg-violet-500/[0.05] p-3 text-[12px] text-violet-100">
            <Loading03Icon size={14} className="animate-spin" />
            {phaseLabel(fundState.phase)}… confirm in your wallet
          </div>
        ) : null}

        {error || (fundState.phase === "error" && fundState.error) ? (
          <p className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-[12px] text-red-200">
            {error ?? fundState.error}
          </p>
        ) : null}

        {isConnected ? (
          <Button variant="violet" size="lg" onClick={submit} disabled={busy || !match}>
            {busy ? <Loading03Icon size={14} className="animate-spin" /> : null}
            {busy
              ? stake > 0
                ? phaseLabel(fundState.phase)
                : "Saving"
              : stake > 0
                ? `Back with ${stake} USDT`
                : "Lock in free call"}
          </Button>
        ) : (
          <ConnectButton />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Your calls · {predictions.length}
        </h2>
        {!isConnected ? (
          <EmptyState icon={<CoinsDollarIcon size={16} />} label="CONNECT_TO_VIEW" hint="Connect your wallet to see your call history." />
        ) : predictions.length === 0 ? (
          <EmptyState icon={<FootballIcon size={16} />} label="NO_CALLS" hint="Make your first call. It will show up here with its result." />
        ) : (
          predictions.map((item) => <PredictionRow key={item.id} prediction={item} />)
        )}
      </div>
    </div>
  );
}

function PredictionRow({ prediction }: { prediction: PredictionRecord }) {
  const tone =
    prediction.status === "WON"
      ? "text-emerald-300"
      : prediction.status === "LOST"
        ? "text-red-300"
        : "text-zinc-400";
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0B0B0E] p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          {prediction.matchExternalId}
        </span>
        <span className={cn("font-mono text-[10px] uppercase tracking-[0.18em]", tone)}>
          {prediction.status}
        </span>
      </div>
      <p className="mt-1.5 text-sm text-zinc-100">
        {prediction.market} · <span className="text-violet-200">{prediction.side}</span>
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
          {prediction.stakeUsdt > 0 ? `${prediction.stakeUsdt} USDT · ` : "Free call · "}
          {timeAgo(Date.parse(prediction.createdAt))}
        </p>
        {prediction.txHash ? <TxLink hash={prediction.txHash} chars={5} /> : null}
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">{label}</p>
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
          ? "border-violet-400/50 bg-violet-500/[0.08] text-violet-100"
          : "border-white/10 text-zinc-400 hover:border-white/25 hover:text-zinc-100",
      )}
    >
      {label}
    </button>
  );
}
