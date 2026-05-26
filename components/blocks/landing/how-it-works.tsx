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
    body: "OKX Wallet, MetaMask, or WalletConnect on X Layer testnet. Your funds stay in your wallet. Whistle never holds them.",
    icon: Wallet01Icon,
  },
  {
    n: "02",
    label: "Fund",
    title: "Back Emma, Jack, or Tom",
    body: "Allocate test WHST to the helper you trust and set a per-match limit. One signature, fully onchain.",
    icon: Key01Icon,
  },
  {
    n: "03",
    label: "They act onchain",
    title: "Real moves during the match",
    body: "Emma mints the best moments as NFTs, Jack places match bets, Tom drafts your fantasy team. Every move is a real transaction you can verify.",
    icon: ChartHistogramIcon,
  },
  {
    n: "04",
    label: "You own it",
    title: "Keep what they make",
    body: "Moment NFTs land in your wallet, settled bets pay back to your balance, and your team climbs the leaderboard and your private leagues.",
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
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-500 dark:text-violet-300">
            How it works
          </span>
          <h2 className="mt-3 max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-5xl">
            You fund. <span className="font-serif-italic text-violet-500 dark:text-violet-300">They play.</span> You own it.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            Three AI helpers act for you during live World Cup matches. You stay in control of the money and keep everything they make.
          </p>
        </motion.div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="grid sm:grid-cols-2">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-15%" }}
                transition={{ type: "spring", stiffness: 280, damping: 30, delay: i * 0.05 }}
                className={cn(
                  "flex h-full flex-col gap-5 border-b border-border p-6 transition-colors hover:bg-foreground/[0.02]",
                  "sm:border-r sm:[&:nth-child(2n)]:border-r-0",
                  "sm:[&:nth-child(n+3)]:border-b-0",
                  "last:border-b-0",
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                    {step.n} · {step.label}
                  </span>
                  <step.icon size={18} className="text-violet-500 dark:text-violet-300" />
                </div>
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">{step.body}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
