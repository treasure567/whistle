"use client";

import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { CoinsDollarIcon, FootballIcon, Loading03Icon, Search01Icon, ShieldBlockchainIcon } from "hugeicons-react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/ui/connect-button";
import { EmptyState } from "@/components/ui/empty-state";
import { FlagOrb } from "@/components/ui/flag-orb";
import { TxLink } from "@/components/ui/tx-link";
import { ApiError } from "@/lib/api/client";
import { createPrediction, fetchPredictions } from "@/lib/api/predictions";
import type { Fixture } from "@/lib/api/fixtures";
import type { PredictionRecord } from "@/lib/api/schemas";
import { AGENTS } from "@/lib/mock";
import { formatUsdt, timeAgo } from "@/lib/format";
import { teamName } from "@/lib/wc-teams";
import { useFundAgent, phaseLabel } from "@/hooks/use-fund-agent";
import { JackSlip } from "./jack-slip";
import { cn } from "@/lib/utils";

type Side = { id: string; label: string };
type Category = "Match" | "Goals" | "Corners" | "Cards" | "Fouls" | "Specials";
type Market = {
  id: string;
  label: string;
  category: Category;
  sides: (home: string, away: string) => Side[];
};

const yesNo = (): Side[] => [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
];
const overUnder = (line: string) => (): Side[] => [
  { id: "over", label: `Over ${line}` },
  { id: "under", label: `Under ${line}` },
];
const wdl = (home: string, away: string): Side[] => [
  { id: "home", label: home },
  { id: "draw", label: "Draw" },
  { id: "away", label: away },
];
const teams = (home: string, away: string): Side[] => [
  { id: "home", label: home },
  { id: "away", label: away },
];

const CATEGORIES: ReadonlyArray<Category> = ["Match", "Goals", "Corners", "Cards", "Fouls", "Specials"];

const MARKETS: ReadonlyArray<Market> = [
  { id: "1x2", label: "Match result", category: "Match", sides: wdl },
  {
    id: "dc",
    label: "Double chance",
    category: "Match",
    sides: (h, a) => [
      { id: "1x", label: `${h} or draw` },
      { id: "12", label: "Either team" },
      { id: "x2", label: `Draw or ${a}` },
    ],
  },
  { id: "dnb", label: "Draw no bet", category: "Match", sides: teams },
  { id: "ht1x2", label: "Half-time result", category: "Match", sides: wdl },

  { id: "btts", label: "Both teams to score", category: "Goals", sides: yesNo },
  { id: "ou15", label: "Over/Under 1.5 goals", category: "Goals", sides: overUnder("1.5") },
  { id: "ou25", label: "Over/Under 2.5 goals", category: "Goals", sides: overUnder("2.5") },
  { id: "ou35", label: "Over/Under 3.5 goals", category: "Goals", sides: overUnder("3.5") },
  {
    id: "oddeven",
    label: "Total goals odd/even",
    category: "Goals",
    sides: () => [
      { id: "odd", label: "Odd" },
      { id: "even", label: "Even" },
    ],
  },
  {
    id: "firstgoal",
    label: "First team to score",
    category: "Goals",
    sides: (h, a) => [
      { id: "home", label: h },
      { id: "away", label: a },
      { id: "none", label: "No goal" },
    ],
  },

  { id: "corners85", label: "Total corners O/U 8.5", category: "Corners", sides: overUnder("8.5") },
  { id: "corners95", label: "Total corners O/U 9.5", category: "Corners", sides: overUnder("9.5") },
  { id: "corners105", label: "Total corners O/U 10.5", category: "Corners", sides: overUnder("10.5") },
  { id: "mostcorners", label: "Most corners", category: "Corners", sides: wdl },

  { id: "redcard", label: "Red card shown", category: "Cards", sides: yesNo },
  { id: "cards35", label: "Total cards O/U 3.5", category: "Cards", sides: overUnder("3.5") },
  { id: "cards45", label: "Total cards O/U 4.5", category: "Cards", sides: overUnder("4.5") },
  { id: "mostcards", label: "Most cards", category: "Cards", sides: wdl },

  { id: "fouls205", label: "Total fouls O/U 20.5", category: "Fouls", sides: overUnder("20.5") },
  { id: "fouls245", label: "Total fouls O/U 24.5", category: "Fouls", sides: overUnder("24.5") },

  { id: "penalty", label: "Penalty awarded", category: "Specials", sides: yesNo },
  { id: "wintonil", label: "Win to nil", category: "Specials", sides: teams },
  { id: "cleansheet", label: "Team keeps clean sheet", category: "Specials", sides: teams },
];

const STAKES = [0, 5, 10, 25] as const;

const KICK_FMT = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });

function fixtureTag(f: Fixture): string {
  if (f.group) return `Grp ${f.group.replace(/^Group\s*/i, "")}`;
  if (f.stage) return f.stage;
  return KICK_FMT.format(f.kickoffAt);
}

function marketsIn(category: Category): Market[] {
  return MARKETS.filter((market) => market.category === category);
}

export function PredictView({ fixtures, initialMatchId }: { fixtures: Fixture[]; initialMatchId?: string }) {
  const { address, isConnected } = useAccount();
  const { state: fundState, fund, reset: resetFund } = useFundAgent();
  const jack = AGENTS.bookie;
  const [mode, setMode] = useState<"manual" | "jack">("manual");
  const [matchId, setMatchId] = useState<string>(
    (initialMatchId && fixtures.some((f) => f.id === initialMatchId) ? initialMatchId : fixtures[0]?.id) ?? "",
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category>("Match");
  const [marketId, setMarketId] = useState<string>(MARKETS[0]!.id);
  const [sideId, setSideId] = useState<string>("home");
  const [stake, setStake] = useState<number>(0);
  const [savingFree, setSavingFree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<PredictionRecord[]>([]);

  const match = fixtures.find((item) => item.id === matchId);
  const homeName = match ? teamName(match.homeCode) : "Home";
  const awayName = match ? teamName(match.awayCode) : "Away";
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return fixtures;
    return fixtures.filter((f) => {
      const h = teamName(f.homeCode).toLowerCase();
      const a = teamName(f.awayCode).toLowerCase();
      return (
        h.includes(q) ||
        a.includes(q) ||
        f.homeCode.toLowerCase().includes(q) ||
        f.awayCode.toLowerCase().includes(q) ||
        (f.group ?? "").toLowerCase().includes(q)
      );
    });
  }, [fixtures, query]);
  const market = MARKETS.find((item) => item.id === marketId) ?? MARKETS[0]!;
  const sides = useMemo(() => market.sides(homeName, awayName), [market, homeName, awayName]);

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
    setSideId(next.sides(homeName, awayName)[0]!.id);
  }

  function selectCategory(cat: Category) {
    setCategory(cat);
    const first = marketsIn(cat)[0];
    if (first) {
      setMarketId(first.id);
      setSideId(first.sides(homeName, awayName)[0]!.id);
    }
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

  if (fixtures.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 md:px-10">
        <EmptyState
          icon={<FootballIcon size={16} />}
          label="NO_FIXTURES"
          hint="Fixtures aren't loaded yet. Start the backend and seed the schedule, then refresh."
        />
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-7xl items-start gap-6 px-6 md:grid-cols-[1.2fr_1fr] md:px-10">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          <Chip active={mode === "manual"} onClick={() => setMode("manual")} label="Make a pick" />
          <Chip active={mode === "jack"} onClick={() => setMode("jack")} label="Ask Jack to bet for me" />
        </div>
        {mode === "jack" ? (
          <JackSlip onBooked={(created) => setPredictions((prev) => [...created, ...prev])} />
        ) : (
        <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
        <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/[0.04] p-3">
          <AgentAvatar agent="bookie" size={40} />
          <div>
            <p className="text-sm font-semibold text-foreground">{jack.name} the Bookie</p>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-amber-200/80">
              Backs your call onchain
            </p>
          </div>
        </div>

        <Section label="Match">
          <div className="relative mb-2">
            <Search01Icon size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a team or group"
              aria-label="Search fixtures"
              className="h-9 w-full rounded-xl border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-violet-400/50"
            />
          </div>
          <div className="max-h-64 divide-y divide-border overflow-y-auto rounded-xl border border-border">
            {filtered.length === 0 ? (
              <p className="px-4 py-6 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                No fixtures match
              </p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMatchId(item.id)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors",
                    matchId === item.id ? "bg-violet-500/[0.06]" : "hover:bg-foreground/[0.02]",
                  )}
                >
                  <span className="flex min-w-0 items-center gap-1.5">
                    <FlagOrb code={item.homeCode} size={18} />
                    <span className="truncate text-[13px] text-foreground">{teamName(item.homeCode)}</span>
                    <span className="shrink-0 text-[11px] text-muted-foreground">v</span>
                    <span className="truncate text-[13px] text-foreground">{teamName(item.awayCode)}</span>
                    <FlagOrb code={item.awayCode} size={18} />
                  </span>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    {fixtureTag(item)}
                  </span>
                </button>
              ))
            )}
          </div>
        </Section>

        <Section label="Market type">
          <div className="mb-2 flex flex-wrap gap-1.5">
            {CATEGORIES.map((cat) => (
              <Chip key={cat} active={category === cat} onClick={() => selectCategory(cat)} label={cat} />
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {marketsIn(category).map((item) => (
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
                label={value === 0 ? "Free call" : `${value} WHST`}
              />
            ))}
          </div>
          {stake > 0 ? (
            <p className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-200/80">
              <ShieldBlockchainIcon size={12} />
              Funds {jack.name} with {formatUsdt(stake)} onchain — one signature.
            </p>
          ) : (
            <p className="mt-2 text-[11px] text-muted-foreground">A free call is recorded off-chain. No wallet signature.</p>
          )}
        </Section>

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

        {isConnected ? (
          <Button variant="violet" size="lg" onClick={submit} disabled={busy || !match}>
            {busy ? <Loading03Icon size={14} className="animate-spin" /> : null}
            {busy
              ? stake > 0
                ? phaseLabel(fundState.phase)
                : "Saving"
              : stake > 0
                ? `Back with ${stake} WHST`
                : "Lock in free call"}
          </Button>
        ) : (
          <ConnectButton />
        )}
        </div>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
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
      ? "text-emerald-600 dark:text-emerald-300"
      : prediction.status === "LOST"
        ? "text-red-600 dark:text-red-300"
        : "text-muted-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {prediction.matchExternalId}
        </span>
        <span className={cn("font-mono text-[10px] uppercase tracking-[0.18em]", tone)}>
          {prediction.status}
        </span>
      </div>
      <p className="mt-1.5 text-sm text-foreground">
        {prediction.market} · <span className="text-violet-500 dark:text-violet-300">{prediction.side}</span>
      </p>
      <div className="mt-1 flex items-center justify-between gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
          {prediction.stakeUsdt > 0 ? `${prediction.stakeUsdt} WHST · ` : "Free call · "}
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
