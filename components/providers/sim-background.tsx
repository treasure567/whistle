"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Cancel01Icon } from "hugeicons-react";

import { FlagOrb } from "@/components/ui/flag-orb";
import { simulateMatch, type SimResult, type SimTeam } from "@/lib/sim/engine";
import { cn } from "@/lib/utils";

export type BgMatch = { id: string; home: SimTeam; away: SimTeam; minute: number; result: SimResult };

type SimBackgroundValue = {
  matches: BgMatch[];
  start: (home: SimTeam, away: SimTeam) => void;
  remove: (id: string) => void;
};

const SimBackgroundContext = createContext<SimBackgroundValue | null>(null);
const TICK_MS = 700;
const MAX_BG = 4;

export function useSimBackground(): SimBackgroundValue {
  return useContext(SimBackgroundContext) ?? { matches: [], start: () => undefined, remove: () => undefined };
}

export function SimBackgroundProvider({ children }: { children: ReactNode }) {
  const [matches, setMatches] = useState<BgMatch[]>([]);

  useEffect(() => {
    const t = setInterval(() => {
      setMatches((prev) => prev.map((m) => (m.minute >= 90 ? m : { ...m, minute: m.minute + 1 })));
    }, TICK_MS);
    return () => clearInterval(t);
  }, []);

  const start = useCallback((home: SimTeam, away: SimTeam) => {
    setMatches((prev) => {
      if (prev.length >= MAX_BG) return prev;
      return [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          home,
          away,
          minute: 0,
          result: simulateMatch(home, away),
        },
      ];
    });
  }, []);

  const remove = useCallback((id: string) => setMatches((prev) => prev.filter((m) => m.id !== id)), []);

  return (
    <SimBackgroundContext.Provider value={{ matches, start, remove }}>
      {children}
      <SimBackgroundDock />
    </SimBackgroundContext.Provider>
  );
}

function SimBackgroundDock() {
  const { matches, remove } = useSimBackground();
  if (matches.length === 0) return null;
  return (
    <div className="fixed bottom-4 right-4 z-40 flex w-60 flex-col gap-2">
      {matches.map((m) => {
        const seen = m.result.events.filter((e) => e.minute <= m.minute);
        const hs = seen.filter((e) => (e.type === "goal" || e.type === "penalty-goal") && e.side === "home").length;
        const as = seen.filter((e) => (e.type === "goal" || e.type === "penalty-goal") && e.side === "away").length;
        const done = m.minute >= 90;
        return (
          <div key={m.id} className="rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                <span className={cn("dot-live", done && "dot-live--ok")} style={{ position: "static" }} />
                {done ? "FT" : `${m.minute}'`}
              </span>
              <button
                type="button"
                onClick={() => remove(m.id)}
                aria-label="Dismiss"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Cancel01Icon size={12} />
              </button>
            </div>
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <FlagOrb code={m.home.code} size={18} />
                <span className="font-mono text-[12px] text-foreground">{m.home.code}</span>
              </span>
              <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                {hs}-{as}
              </span>
              <span className="flex items-center gap-1.5">
                <span className="font-mono text-[12px] text-foreground">{m.away.code}</span>
                <FlagOrb code={m.away.code} size={18} />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
