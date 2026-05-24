"use client";

import { motion } from "motion/react";

import { AgentCard } from "@/components/ui/agent-card";
import { AGENT_LIST } from "@/lib/mock";

export function AgentsSection() {
  return (
    <section id="agents" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
              The team
            </span>
            <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-zinc-50 md:text-5xl">
              Three helpers. <span className="font-serif italic font-normal text-violet-200">One app.</span>
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-zinc-400">
            Each person has a clear job. You set a spending limit. They work
            inside it — and every action is logged so you can see what happened.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {AGENT_LIST.map((agent, i) => (
            <motion.div
              key={agent.slug}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30, delay: i * 0.06 }}
            >
              <AgentCard agent={agent} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
