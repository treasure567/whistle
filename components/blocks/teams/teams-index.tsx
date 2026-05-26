"use client";

import Link from "next/link";
import { motion } from "motion/react";

import { GlowCard } from "@/components/ui/glow-card";
import { FlagOrb } from "@/components/ui/flag-orb";
import { SQUADS } from "@/lib/mock/squads";
import { groupByCountry } from "@/lib/mock/groups";

const spring = { type: "spring" as const, stiffness: 380, damping: 30 };

export function TeamsIndex() {
  const entries = Object.values(SQUADS).sort((a, b) =>
    a.country.localeCompare(b.country),
  );

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {entries.map((squad, i) => {
          const grp = groupByCountry(squad.code);
          return (
            <motion.div
              key={squad.code}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ ...spring, delay: Math.min(i * 0.02, 0.4) }}
            >
              <Link href={`/teams/${squad.code}`} className="group block">
                <GlowCard
                  padding="none"
                  className="transition-colors hover:border-violet-500/30"
                >
                  <div className="flex flex-col items-center gap-2 p-4">
                    <FlagOrb code={squad.code} size={56} />
                    <span className="font-mono text-[11px] tracking-wide text-foreground">
                      {squad.code}
                    </span>
                    <span className="text-center text-[11px] leading-tight text-muted-foreground group-hover:text-foreground">
                      {squad.country}
                    </span>
                    {grp && (
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground">
                        Group {grp.letter}
                      </span>
                    )}
                  </div>
                </GlowCard>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
