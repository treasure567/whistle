"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight01Icon } from "hugeicons-react";

import { AmbientGlow } from "@/components/ui/ambient-glow";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Button } from "@/components/ui/button";
import { Sparkline } from "@/components/ui/sparkline";
import type { Agent } from "@/types";
import { formatPercent, formatUsdt } from "@/lib/format";

const AGENT_CLASS: Record<Agent["slug"], string> = {
  scout: "agent-scout",
  bookie: "agent-bookie",
  manager: "agent-manager",
};

interface AgentHeroProps {
  agent: Agent;
}

export function AgentHero({ agent }: AgentHeroProps) {
  return (
    <section
      className={`${AGENT_CLASS[agent.slug]} relative overflow-hidden pt-[calc(4rem+2.5rem)] pb-12 md:pt-32 md:pb-16`}
    >
      <AmbientGlow position="top" intensity="strong" size={1000} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-[1.1fr_1fr] md:gap-16 md:px-10">
        <div>
          <Link
            href="/agents"
            className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-500 transition-colors hover:text-violet-200"
          >
            ← The team
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="mt-6 flex items-center gap-4"
          >
            <AgentAvatar agent={agent.slug} size={64} />
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.22em] agent-tint-text">
                {agent.role}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-zinc-50 md:text-5xl">
                {agent.name}
              </h1>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.05 }}
            className="mt-6 max-w-xl text-lg leading-relaxed text-zinc-300"
          >
            {agent.tagline}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.1 }}
            className="mt-6 max-w-xl border-l-2 border-white/10 pl-4 font-mono text-[13px] italic text-zinc-400"
          >
            “{agent.personaQuote}”
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30, delay: 0.15 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href={`/allocate?agent=${agent.slug}`}>
              <Button variant="violet" size="pill">
                Fund {agent.name}
                <ArrowRight01Icon size={14} />
              </Button>
            </Link>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              {agent.stats.allocatorsCount} people backing {agent.name}
            </span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 30, delay: 0.2 }}
          className="rounded-3xl border border-white/10 bg-[#0B0B0E] p-8 agent-tint-glow"
        >
          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
            <Stat
              label="Decisions"
              value={agent.stats.totalDecisions.toString()}
              hint={`${agent.stats.matchesActedOn} matches`}
            />
            <Stat
              label={agent.slug === "scout" ? "Backers" : "Money funded"}
              value={
                agent.slug === "scout"
                  ? agent.stats.allocatorsCount.toString()
                  : formatUsdt(agent.stats.capitalAssignedUsdt, { compact: true })
              }
            />
            <Stat
              label={agent.slug === "scout" ? "Avg. highlight score" : "Total volume"}
              value={
                agent.slug === "scout"
                  ? "0.84"
                  : formatUsdt(agent.stats.totalVolumeUsdt, { compact: true })
              }
            />
            <Stat
              label={agent.slug === "scout" ? "Moments / match" : "Win rate"}
              value={
                agent.slug === "scout"
                  ? (agent.stats.totalDecisions / Math.max(agent.stats.matchesActedOn, 1)).toFixed(1)
                  : formatPercent(agent.stats.winRatePct)
              }
            />
          </div>
          <div className="mt-6 border-t border-white/5 pt-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Track record · 18 matches
              </span>
              {agent.slug !== "scout" ? (
                <span className="font-mono text-[12px] text-emerald-300">
                  +{formatUsdt(agent.stats.pnlUsdt, { compact: true })}
                </span>
              ) : (
                <span className="font-mono text-[12px] text-zinc-400">
                  {agent.stats.totalDecisions} moments saved
                </span>
              )}
            </div>
            <div className="mt-3">
              <Sparkline
                data={agent.stats.trackRecord}
                stroke={agent.accentHex}
                height={70}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </span>
      <span className="font-mono text-2xl text-zinc-100 tabular-nums">{value}</span>
      {hint ? <span className="text-[11px] text-zinc-500">{hint}</span> : null}
    </div>
  );
}
