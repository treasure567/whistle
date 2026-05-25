"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";

import { FlagOrb } from "@/components/ui/flag-orb";
import { cn } from "@/lib/utils";

type Kick = { side: "home" | "away"; scored: boolean };
export type ShootoutResult = { homeWon: boolean; homePens: number; awayPens: number };

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function decided(h: number, a: number, hk: number, ak: number): boolean {
  return h > a + (5 - ak) || a > h + (5 - hk);
}

function simulateShootout(homeStrength: number, awayStrength: number): { kicks: Kick[]; homeWon: boolean } {
  const ph = clamp(0.7 + (homeStrength - 0.5) * 0.22, 0.55, 0.9);
  const pa = clamp(0.7 + (awayStrength - 0.5) * 0.22, 0.55, 0.9);
  const kicks: Kick[] = [];
  let h = 0;
  let a = 0;
  let hk = 0;
  let ak = 0;

  for (let round = 0; round < 5; round += 1) {
    const hScored = Math.random() < ph;
    kicks.push({ side: "home", scored: hScored });
    if (hScored) h += 1;
    hk += 1;
    if (decided(h, a, hk, ak)) break;
    const aScored = Math.random() < pa;
    kicks.push({ side: "away", scored: aScored });
    if (aScored) a += 1;
    ak += 1;
    if (decided(h, a, hk, ak)) break;
  }

  // Sudden death until a round separates them.
  while (h === a) {
    const hScored = Math.random() < ph;
    kicks.push({ side: "home", scored: hScored });
    if (hScored) h += 1;
    const aScored = Math.random() < pa;
    kicks.push({ side: "away", scored: aScored });
    if (aScored) a += 1;
  }

  return { kicks, homeWon: h > a };
}

export function PenaltyShootout({
  homeCode,
  awayCode,
  homeStrength,
  awayStrength,
  onResult,
}: {
  homeCode: string;
  awayCode: string;
  homeStrength: number;
  awayStrength: number;
  onResult: (result: ShootoutResult) => void;
}) {
  const [plan] = useState(() => simulateShootout(homeStrength, awayStrength));
  const kicks = plan.kicks;

  const [shown, setShown] = useState(0);
  const reported = useRef(false);

  useEffect(() => {
    const t = setInterval(() => {
      setShown((s) => {
        if (s >= kicks.length) {
          clearInterval(t);
          return s;
        }
        return s + 1;
      });
    }, 850);
    return () => clearInterval(t);
  }, [kicks.length]);

  useEffect(() => {
    if (shown < kicks.length || reported.current) return;
    reported.current = true;
    const homePens = kicks.filter((k) => k.side === "home" && k.scored).length;
    const awayPens = kicks.filter((k) => k.side === "away" && k.scored).length;
    const homeWon = plan.homeWon;
    const id = setTimeout(() => onResult({ homeWon, homePens, awayPens }), 700);
    return () => clearTimeout(id);
  }, [shown, kicks, plan, onResult]);

  const visible = kicks.slice(0, shown);
  const homePens = visible.filter((k) => k.side === "home" && k.scored).length;
  const awayPens = visible.filter((k) => k.side === "away" && k.scored).length;
  const settled = shown >= kicks.length;

  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/[0.05] p-5">
      <p className="mb-3 text-center font-mono text-[11px] uppercase tracking-[0.22em] text-amber-600 dark:text-amber-300">
        Level after extra time · penalties
      </p>
      <div className="mb-4 flex items-center justify-center gap-4 font-mono text-2xl font-semibold tabular-nums text-foreground">
        <span className="flex items-center gap-2">
          <FlagOrb code={homeCode} size={22} /> {homePens}
        </span>
        <span className="text-muted-foreground">-</span>
        <span className="flex items-center gap-2">
          {awayPens} <FlagOrb code={awayCode} size={22} />
        </span>
      </div>
      <Row side="home" kicks={visible} />
      <div className="h-1.5" />
      <Row side="away" kicks={visible} />
      <p className="mt-3 text-center font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {settled ? "That's the shootout" : "Sudden tension at the spot…"}
      </p>
    </div>
  );
}

function Row({ side, kicks }: { side: "home" | "away"; kicks: Kick[] }) {
  const ours = kicks.filter((k) => k.side === side);
  return (
    <div className="flex flex-wrap justify-center gap-1.5">
      {ours.map((k, i) => (
        <motion.span
          key={i}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 420, damping: 22 }}
          className={cn(
            "size-3.5 rounded-full ring-1",
            k.scored ? "bg-emerald-500 ring-emerald-300/50" : "bg-red-500/80 ring-red-300/50",
          )}
        />
      ))}
    </div>
  );
}
