"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight01Icon, ArrowUpRight01Icon } from "hugeicons-react";

import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Button } from "@/components/ui/button";
import { MatchClock } from "@/components/ui/match-clock";
import { LIVE_MATCH } from "@/lib/mock";

const ThreeDStadium = dynamic(
  () =>
    import("@/components/ui/three-d-stadium").then((m) => ({
      default: m.ThreeDStadium,
    })),
  {
    ssr: false,
    loading: () => <StadiumFallback />,
  },
);

function StadiumFallback() {
  return (
    <div className="absolute inset-0 grid place-items-center">
      <div className="relative size-72">
        <div className="absolute inset-0 rounded-full border border-violet-500/20" />
        <div className="absolute inset-6 rounded-full border border-violet-500/30" />
        <div className="absolute inset-14 rounded-full border border-violet-500/40 animate-pulse" />
      </div>
    </div>
  );
}

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
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...heroSpring, delay: 0.05 }}
            className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/[0.06] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.22em] text-violet-200"
          >
            <span className="size-1.5 rounded-full bg-violet-400" />
            xdev · OKX X Cup · X Layer mainnet
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...heroSpring, delay: 0.1 }}
            className="mt-6 text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-zinc-50 md:text-6xl"
          >
            Three agents.
            <br />
            <span className="font-serif italic font-normal text-violet-200">Every match.</span>
            <br />
            Onchain.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...heroSpring, delay: 0.18 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-zinc-400"
          >
            xdev is an AI Agent Stable. Scout mints the moments that matter. Bookie takes the edge on micro-markets. Manager drafts the eleven. You don&apos;t pick — you allocate. They act.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...heroSpring, delay: 0.26 }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link href="/allocate">
              <Button variant="violet" size="pill">
                Allocate to an agent
                <ArrowRight01Icon size={14} />
              </Button>
            </Link>
            <Link href="/agents">
              <Button variant="outline" size="pill">
                Meet the stable
                <ArrowUpRight01Icon size={14} />
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...heroSpring, delay: 0.32 }}
            className="mt-10 grid max-w-xl grid-cols-3 gap-6 border-t border-white/5 pt-6"
          >
            <HeroStat label="Agents in stable" value="3" hint="Scout · Bookie · Manager" />
            <HeroStat label="Onchain txs" value="412" hint="across 18 matches" />
            <HeroStat label="Capital assigned" value="$107.3k" hint="bounded by session keys" />
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 280, damping: 30, delay: 0.2 }}
          className="relative aspect-square min-h-[420px] w-full md:min-h-[560px]"
        >
          <ThreeDStadium className="absolute inset-0" />

          <div className="pointer-events-none absolute inset-x-0 top-6 z-10 flex items-center justify-between px-6">
            <MatchClock match={LIVE_MATCH} size="sm" />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
              {LIVE_MATCH.home} {LIVE_MATCH.scoreHome} — {LIVE_MATCH.scoreAway} {LIVE_MATCH.away}
            </span>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-4 z-10 grid grid-cols-3 gap-2 px-4">
            <OrbitChip name="Scout" color="bg-zinc-400" hint="Moments" />
            <OrbitChip name="Bookie" color="bg-amber-400" hint="Edge" />
            <OrbitChip name="Manager" color="bg-emerald-400" hint="Roster" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function HeroStat({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </span>
      <span className="font-mono text-2xl text-zinc-100 tabular-nums">{value}</span>
      <span className="text-[11px] text-zinc-500">{hint}</span>
    </div>
  );
}

function OrbitChip({
  name,
  color,
  hint,
}: {
  name: string;
  color: string;
  hint: string;
}) {
  return (
    <div className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-[rgba(10,10,10,0.65)] px-3 py-1.5 backdrop-blur-md">
      <span className={`size-2 rounded-full ${color}`} />
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-200">
        {name}
      </span>
      <span className="font-mono text-[10px] text-zinc-500">{hint}</span>
    </div>
  );
}
