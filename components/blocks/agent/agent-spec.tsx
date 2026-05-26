"use client";

import { motion } from "motion/react";

import type { Agent } from "@/types";

interface Row {
  label: string;
  body: string;
}

interface AgentSpecProps {
  agent: Agent;
}

export function AgentSpec({ agent }: AgentSpecProps) {
  const rows: Row[] = [
    { label: "Watches", body: agent.watches },
    { label: "Does", body: agent.acts },
    { label: "Approach", body: agent.strategy },
    { label: "Your limit", body: agent.capitalModel },
    { label: "Focus", body: agent.tracks.join(" · ") },
  ];

  return (
    <section className="relative py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
              How {agent.name} works
            </span>
            <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
              Clear rules. <span className="font-serif-italic text-violet-500 dark:text-violet-200">No surprises.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              {agent.name}&apos;s approach is fixed and public. You always know
              what they watch for, what they do, and how much they can spend.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            {rows.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: i * 0.04 }}
                className="grid grid-cols-1 gap-2 border-b border-border px-6 py-5 last:border-b-0 md:grid-cols-[180px_1fr] md:gap-6"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                  {row.label}
                </span>
                <p className="text-[14px] leading-relaxed text-foreground">{row.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
