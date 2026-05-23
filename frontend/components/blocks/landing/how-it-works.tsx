"use client";

import { motion } from "motion/react";
import {
  Wallet01Icon,
  Key01Icon,
  ChartHistogramIcon,
  BookOpen01Icon,
} from "hugeicons-react";

import { GlowCard } from "@/components/ui/glow-card";

const STEPS = [
  {
    n: "01",
    label: "Connect",
    title: "Plug a wallet on X Layer",
    body: "OKX Wallet, WalletConnect, or Coinbase. xdev never custodies funds — your capital sits in PositionManager.sol.",
    icon: Wallet01Icon,
  },
  {
    n: "02",
    label: "Allocate",
    title: "Pick an agent. Set a ceiling.",
    body: "Choose Scout, Bookie, or Manager. Set the per-session and per-match cap. Sign once — a bounded session key issues from the AgentRegistry.",
    icon: Key01Icon,
  },
  {
    n: "03",
    label: "Watch",
    title: "The agent acts onchain",
    body: "Live match flow drives the decision loop. Every meaningful step — a mint, an open, a roster change — is a transaction. Every transaction settles in one block.",
    icon: ChartHistogramIcon,
  },
  {
    n: "04",
    label: "Read",
    title: "Public, auditable track record",
    body: "All decisions land on the activity ledger. Filter by agent, by match, by outcome. Top managers ride to the leaderboard. Bottom ones get fired.",
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
            The loop
          </span>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-zinc-50 md:text-5xl">
            Allocate. <span className="font-serif italic font-normal text-violet-200">Agent acts.</span> Settle.
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ type: "spring", stiffness: 280, damping: 30, delay: i * 0.05 }}
            >
              <GlowCard className="relative flex h-full flex-col gap-5 rounded-2xl p-6">
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
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
