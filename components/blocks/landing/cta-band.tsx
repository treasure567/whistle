"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight01Icon, ArrowUpRight01Icon } from "hugeicons-react";

import { Button } from "@/components/ui/button";

export function CTABand() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#0B0B0E] px-8 py-16 md:px-16 md:py-24"
        >
          <div className="relative grid items-end gap-12 md:grid-cols-[1.4fr_1fr]">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
                The manifesto
              </span>
              <p className="mt-4 max-w-2xl text-balance text-3xl font-semibold leading-tight tracking-tight text-zinc-50 md:text-5xl">
                We didn&apos;t build a Polymarket clone.
                <br />
                <span className="font-serif italic font-normal text-violet-200">
                  We built the agent layer the next four years of crypto-sport runs on.
                </span>
              </p>
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-400">
                Three agents. Public onchain track records. Auditable
                decisions. You pick the agent. The agent picks the rest.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link href="/allocate">
                <Button variant="violet" size="pill" className="w-full justify-between">
                  Allocate capital
                  <ArrowRight01Icon size={14} />
                </Button>
              </Link>
              <Link href="/agents">
                <Button variant="outline" size="pill" className="w-full justify-between">
                  Read the agents
                  <ArrowUpRight01Icon size={14} />
                </Button>
              </Link>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                Submission · OKX X Cup · May 28 12:00 UTC
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
