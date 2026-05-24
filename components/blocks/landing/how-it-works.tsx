"use client";

import { motion } from "motion/react";
import {
  Wallet01Icon,
  Key01Icon,
  ChartHistogramIcon,
  BookOpen01Icon,
} from "hugeicons-react";

import { cn } from "@/lib/utils";

const STEPS = [
  {
    n: "01",
    label: "Connect",
    title: "Link your wallet",
    body: "Use OKX Wallet, WalletConnect, or Coinbase. Your money stays in your control — Whistle never holds it for you.",
    icon: Wallet01Icon,
  },
  {
    n: "02",
    label: "Fund",
    title: "Pick Emma, Jack, or Tom",
    body: "Choose who you want to fund and set a spending limit per match. Confirm once — that's all you need to do.",
    icon: Key01Icon,
  },
  {
    n: "03",
    label: "Watch",
    title: "They work during the match",
    body: "While the game plays, your helper saves moments, places bets, or picks players. Every move is logged.",
    icon: ChartHistogramIcon,
  },
  {
    n: "04",
    label: "Review",
    title: "See everything they did",
    body: "Check the activity feed anytime. Filter by person, match, or result. Top performers show up on the leaderboard.",
    icon: BookOpen01Icon,
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
            How it works
          </span>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-zinc-50 md:text-5xl">
            You fund. <span className="font-serif italic font-normal text-violet-200">They play.</span> You watch.
          </h2>
        </motion.div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0E]">
          <div className="grid sm:grid-cols-2">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ type: "spring", stiffness: 280, damping: 30, delay: i * 0.05 }}
                className={cn(
                  "flex h-full flex-col gap-5 border-b border-white/10 p-6 transition-colors hover:bg-white/[0.02]",
                  "sm:border-r sm:[&:nth-child(2n)]:border-r-0",
                  "sm:[&:nth-child(n+3)]:border-b-0",
                  "last:border-b-0",
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    {step.n} · {step.label}
                  </span>
                  <step.icon size={18} className="text-violet-300" />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-zinc-100">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-zinc-400">{step.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
