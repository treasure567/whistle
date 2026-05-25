"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { CoinsDollarIcon, FootballIcon, Loading03Icon } from "hugeicons-react";

import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/ui/connect-button";
import { EmptyState } from "@/components/ui/empty-state";
import { ApiError } from "@/lib/api/client";
import { createPrediction, fetchPredictions } from "@/lib/api/predictions";
import type { PredictionRecord } from "@/lib/api/schemas";
import { timeAgo } from "@/lib/format";
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
  const [matchId, setMatchId] = useState<string>(matches[0]?.id ?? "");
  const [marketId, setMarketId] = useState<string>(MARKETS[0]!.id);
  const [sideId, setSideId] = useState<string>("home");
  const [stake, setStake] = useState<number>(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);

  const match = matches.find((item) => item.id === matchId);
  const market = MARKETS.find((item) => item.id === marketId) ?? MARKETS[0]!;
  const sides = useMemo(() => sidesFor(market.kind, match), [market.kind, match]);

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
    setBusy(true);
    setError(null);
    const side = sides.find((item) => item.id === sideId) ?? sides[0]!;
    try {
      const created = await createPrediction({
        ownerAddress: address,
        matchExternalId: match.id,
        market: market.label,
        side: side.label,
        stakeUsdt: String(stake),
      });
      setPredictions((prev) => [created, ...prev]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your prediction");
    } finally {
      setBusy(false);
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
        <Section label="Match">
          <div className="max-h-48 divide-y divide-white/[0.04] overflow-y-auto rounded-xl border border-white/10">
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

        <Section label="Stake">
          <div className="flex flex-wrap gap-1.5">
            {STAKES.map((value) => (
              <Chip
                key={value}
                active={stake === value}
                onClick={() => setStake(value)}
                label={value === 0 ? "Free pick" : `${value} USDT`}
              />
            ))}
          </div>
        </Section>

        {error ? (
          <p className="rounded-xl border border-red-500/20 bg-red-500/[0.05] p-3 text-[12px] text-red-200">
            {error}
          </p>
        ) : null}

        {isConnected ? (
          <Button variant="violet" size="lg" onClick={submit} disabled={busy || !match}>
            {busy ? <Loading03Icon size={14} className="animate-spin" /> : null}
            {busy ? "Saving" : "Lock in prediction"}
          </Button>
        ) : (
          <ConnectButton />
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Your predictions · {predictions.length}
        </h2>
        {!isConnected ? (
          <EmptyState icon={<CoinsDollarIcon size={16} />} label="CONNECT_TO_VIEW" hint="Connect your wallet to see your prediction history." />
        ) : predictions.length === 0 ? (
          <EmptyState icon={<FootballIcon size={16} />} label="NO_PREDICTIONS" hint="Lock in your first call. It will show up here with its result." />
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
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        {prediction.stakeUsdt > 0 ? `${prediction.stakeUsdt} USDT · ` : "Free pick · "}
        {timeAgo(Date.parse(prediction.createdAt))}
      </p>
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
