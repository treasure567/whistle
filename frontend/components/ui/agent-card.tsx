"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowUpRight01Icon } from "hugeicons-react";

import type { Agent } from "@/types";
import { AgentAvatar } from "@/components/ui/agent-avatar";
import { Sparkline } from "@/components/ui/sparkline";
import { formatUsdt, formatPercent } from "@/lib/format";
import { cn } from "@/lib/utils";

const spring = { type: "spring" as const, stiffness: 380, damping: 32 };

const AGENT_CLASS_MAP: Record<Agent["slug"], string> = {
  scout: "agent-scout",
  bookie: "agent-bookie",
  manager: "agent-manager",
};

interface AgentCardProps {
  agent: Agent;
  variant?: "default" | "compact";
  href?: string;
}

export function AgentCard({ agent, variant = "default", href }: AgentCardProps) {
  const linkHref = href ?? `/agents/${agent.slug}`;
  const isCompact = variant === "compact";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={spring}
      className={cn(
        AGENT_CLASS_MAP[agent.slug],
        "group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#0E0E12] p-6 transition-colors hover:border-white/20",
      )}
    >
      <div className="relative flex items-start justify-between">
        <div className="flex items-center gap-3">
          <AgentAvatar agent={agent.slug} size={44} />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              {agent.glyph} · {agent.tracks.join(" · ")}
            </p>
            <h3 className="text-lg font-semibold tracking-tight text-zinc-100">
              {agent.name}
            </h3>
          </div>
        </div>
        <Link
          href={linkHref}
          className="flex size-9 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition-all hover:border-white/30 hover:text-zinc-100"
          aria-label={`Open ${agent.name}`}
        >
          <ArrowUpRight01Icon size={14} />
        </Link>
      </div>

      <p className="relative mt-4 max-w-[34ch] text-sm leading-relaxed text-zinc-300">
        {agent.tagline}
      </p>

      {!isCompact ? (
        <p className="relative mt-3 border-l-2 border-white/10 pl-3 font-mono text-[11px] leading-relaxed text-zinc-500 italic">
          “{agent.personaQuote}”
        </p>
      ) : null}

      <div className="relative mt-5 grid grid-cols-3 gap-3 border-t border-white/5 pt-4">
        <Stat label="Decisions" value={agent.stats.totalDecisions.toString()} />
        <Stat
          label={agent.slug === "scout" ? "Mints" : "Volume"}
          value={
            agent.slug === "scout"
              ? agent.stats.totalDecisions.toString()
              : formatUsdt(agent.stats.totalVolumeUsdt, { compact: true })
          }
        />
        <Stat
          label={agent.slug === "scout" ? "Allocators" : "Win rate"}
          value={
            agent.slug === "scout"
              ? agent.stats.allocatorsCount.toString()
              : formatPercent(agent.stats.winRatePct)
          }
        />
      </div>

      {!isCompact ? (
        <div className="relative mt-3 -mx-1">
          <Sparkline
            data={agent.stats.trackRecord}
            stroke={agent.accentHex}
            height={50}
          />
        </div>
      ) : null}
    </motion.div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-zinc-500">
        {label}
      </span>
      <span className="font-mono text-sm text-zinc-100 tabular-nums">{value}</span>
    </div>
  );
}
