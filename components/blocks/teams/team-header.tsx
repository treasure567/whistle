"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { FlagOrb } from "@/components/ui/flag-orb";
import { groupByCountry } from "@/lib/mock/groups";
import type { Squad } from "@/types";

const spring = { type: "spring" as const, stiffness: 400, damping: 30 };

interface TeamHeaderProps {
  squad: Squad;
}

export function TeamHeader({ squad }: TeamHeaderProps) {
  const grp = groupByCountry(squad.code);

  return (
    <div className="mx-auto max-w-5xl px-6 pt-[calc(4rem+1.5rem)] md:px-10 md:pt-24">
      <Link
        href="/teams"
        className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground hover:text-violet-500 dark:hover:text-violet-300"
      >
        ← All teams
      </Link>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={spring}
        className="mt-6 flex flex-col items-start gap-5 md:flex-row md:items-center md:justify-between"
      >
        <div className="flex items-center gap-4">
          <FlagOrb code={squad.code} size={72} />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              {squad.country}
            </h1>
            <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
              {squad.code} · {squad.players.length} players
            </p>
          </div>
        </div>
        {grp && (
          <Link
            href="/matches"
            className="rounded-full border border-border bg-foreground/[0.04] px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground transition-colors hover:border-violet-500/30 hover:text-violet-500 dark:hover:text-violet-300"
          >
            Group {grp.letter}
          </Link>
        )}
      </motion.div>
    </div>
  );
}
