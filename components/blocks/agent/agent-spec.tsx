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
    { label: "Acts", body: agent.acts },
    { label: "Strategy", body: agent.strategy },
    { label: "Capital model", body: agent.capitalModel },
    { label: "Track", body: agent.tracks.join(" · ") },
  ];

  return (
    <section className="relative py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <div className="grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
              Specification
            </span>
            <h2 className="mt-3 max-w-md text-3xl font-semibold leading-tight tracking-tight text-zinc-50 md:text-4xl">
              Strategy <span className="font-serif italic font-normal text-violet-200">hash-pinned</span> onchain.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
              {agent.name}&apos;s strategy template is committed to{" "}
              <code className="rounded-sm border border-white/10 bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px] text-violet-200">
                AgentRegistry.sol
              </code>
              . Updates require a new hash and on-chain re-registration.
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0E]">
            {rows.map((row, i) => (
              <motion.div
                key={row.label}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30, delay: i * 0.04 }}
                className="grid grid-cols-1 gap-2 border-b border-white/[0.04] px-6 py-5 last:border-b-0 md:grid-cols-[180px_1fr] md:gap-6"
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  {row.label}
                </span>
                <p className="text-[14px] leading-relaxed text-zinc-200">{row.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
