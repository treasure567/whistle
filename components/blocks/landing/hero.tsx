"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight01Icon, ArrowUpRight01Icon } from "hugeicons-react";

import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Button } from "@/components/ui/button";
import { AgentAvatar } from "@/components/ui/agent-avatar";

const heroSpring = { type: "spring" as const, stiffness: 360, damping: 32 };

export function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-[calc(4rem+1.5rem)] pb-12 sm:pt-[calc(4rem+2rem)] sm:pb-16 md:pt-32 md:pb-24">
      <AmbientGlow position="top" intensity="strong" size={1100} />
      <AmbientGlow position="top-left" intensity="subtle" size={700} />
      <AmbientGlow position="top-right" intensity="subtle" size={700} />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 md:grid-cols-[1.05fr_1fr] md:gap-10 md:px-10">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={heroSpring}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/[0.06] px-3 py-1"
          >
            <span className="size-1.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">
              Live on X Layer Testnet
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...heroSpring, delay: 0.05 }}
            className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl"
          >
            Three agents
            <br />
            <span className="font-serif-italic text-violet-500 dark:text-violet-300">play for you.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...heroSpring, delay: 0.18 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground"
          >
            Whistle gives you three AI helpers for football. Emma mints the best moments as NFTs, Jack places match bets, and Tom drafts your fantasy team. You choose who to fund with test OKB; they act onchain while you watch.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...heroSpring, delay: 0.26 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/allocate">
              <Button variant="violet" size="pill">
                Fund an agent
                <ArrowRight01Icon size={14} />
              </Button>
            </Link>
            <Link href="/agents">
              <Button variant="outline" size="pill">
                Meet Emma, Jack & Tom
                <ArrowUpRight01Icon size={14} />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...heroSpring, delay: 0.32 }}
            className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-border pt-6"
          >
            <HeroStat label="AI helpers" value="3" hint="Emma · Jack · Tom" />
            <HeroStat label="Every action" value="Onchain" hint="verify each tx" />
            <HeroStat label="To play" value="Free" hint="test OKB, no real money" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 30, delay: 0.2 }}
          className="relative aspect-square min-h-[420px] w-full md:min-h-[560px]"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute inset-[8%] rounded-full bg-violet-500/10 blur-3xl"
          />
          <Image
            src="/hero-agents.png"
            alt="Emma, Jack, and Tom — your Whistle agents"
            fill
            priority
            className="object-contain object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 grid grid-cols-3 gap-2 px-4">
            <OrbitChip agent="scout" name="Emma" hint="Moments" />
            <OrbitChip agent="bookie" name="Jack" hint="Bets" />
            <OrbitChip agent="manager" name="Tom" hint="Teams" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HeroStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
        {label}
      </span>
      <span className="font-mono text-2xl text-foreground tabular-nums">{value}</span>
      <span className="text-[11px] text-muted-foreground">{hint}</span>
    </div>
  );
}

function OrbitChip({
  agent,
  name,
  hint,
}: {
  agent: "scout" | "bookie" | "manager";
  name: string;
  hint: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <AgentAvatar agent={agent} size={24} />
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-foreground">
        {name}
      </span>
      <span className="font-mono text-[10px] text-muted-foreground">{hint}</span>
    </div>
  );
}
