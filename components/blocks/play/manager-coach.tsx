"use client";

import { useMemo } from "react";
import { motion } from "motion/react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { SQUAD_SIZE, type SquadValidation } from "@/lib/fantasy";
import { cn } from "@/lib/utils";

type Mood = "setup" | "warn" | "ready";

function coach(
  filled: number,
  remaining: number,
  validation: SquadValidation,
): { line: string; mood: Mood } {
  if (remaining < 0) {
    return { line: `We're ${Math.abs(remaining).toFixed(1)}m over budget — drop a big name.`, mood: "warn" };
  }
  if (filled < SQUAD_SIZE) {
    const left = SQUAD_SIZE - filled;
    return {
      line: `${left} spot${left > 1 ? "s" : ""} left in the squad. ${remaining.toFixed(1)}m still in the bank.`,
      mood: "setup",
    };
  }
  if (!validation.valid) {
    const first = validation.errors[0] ?? "tidy up the squad";
    return { line: `Almost there — ${first.toLowerCase()}.`, mood: "warn" };
  }
  return { line: "Squad's balanced and locked. Save it and I'll take it from here.", mood: "ready" };
}

const MOOD_STYLES: Record<Mood, { wrap: string; dot: string; label: string }> = {
  setup: {
    wrap: "border-border dark:bg-[#0B0B0E]",
    dot: "dot-live--idle",
    label: "text-muted-foreground",
  },
  warn: {
    wrap: "border-amber-500/25 bg-amber-500/[0.04]",
    dot: "",
    label: "text-amber-600 dark:text-amber-300",
  },
  ready: {
    wrap: "border-emerald-500/25 bg-emerald-500/[0.04]",
    dot: "dot-live--ok",
    label: "text-emerald-600 dark:text-emerald-300",
  },
};

export function ManagerCoach({
  filled,
  remaining,
  validation,
}: {
  filled: number;
  remaining: number;
  validation: SquadValidation;
}) {
  const { line, mood } = useMemo(
    () => coach(filled, remaining, validation),
    [filled, remaining, validation],
  );
  const style = MOOD_STYLES[mood];
  const progress = Math.min(100, Math.round((filled / SQUAD_SIZE) * 100));

  return (
    <div className="mx-auto mb-6 max-w-7xl px-6 md:px-10">
      <div className={cn("flex items-center gap-4 rounded-2xl border bg-card p-4 md:p-5", style.wrap)}>
        <div className="relative shrink-0">
          <span className="agent-manager absolute -inset-1 rounded-full bg-[rgb(var(--agent-tint)/0.18)] blur-md" aria-hidden />
          <AgentAvatar agent="manager" size={64} ring className="relative" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold tracking-tight text-foreground">Tom</p>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">
              Your manager
            </span>
            <span className={cn("dot-live ml-auto", style.dot)} style={{ position: "static" }} />
            <span className={cn("font-mono text-[10px] uppercase tracking-[0.18em]", style.label)}>
              {mood === "ready" ? "Ready" : mood === "warn" ? "Needs work" : "Drafting"}
            </span>
          </div>

          <motion.p
            key={line}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="mt-1 text-[13px] leading-relaxed text-muted-foreground"
          >
            {line}
          </motion.p>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-foreground/[0.06]">
              <motion.div
                className={cn("h-full rounded-full", mood === "ready" ? "bg-emerald-400" : "bg-violet-400")}
                initial={false}
                animate={{ width: `${progress}%` }}
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
              />
            </div>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {filled}/{SQUAD_SIZE}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
