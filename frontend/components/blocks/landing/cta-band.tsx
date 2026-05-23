"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight01Icon, ArrowUpRight01Icon } from "hugeicons-react";

import { Button } from "@/components/ui/button";

export function CTABand() {
  return (
    <section className="relative py-16 md:py-20">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-20%" }}
          transition={{ type: "spring", stiffness: 280, damping: 30 }}
          className="overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0B0B0E]"
        >
          <div className="grid items-stretch md:grid-cols-2">
            <div className="flex flex-col justify-center px-6 py-8 md:px-10 md:py-10">
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
                The manifesto
              </span>
              <p className="mt-2 max-w-xl text-balance text-2xl font-semibold leading-[1.15] tracking-tight text-zinc-50 md:text-4xl">
                We didn&apos;t build another betting app.
                <br />
                <span className="font-serif italic font-normal text-violet-200">
                  We built AI helpers that work while you watch the game.
                </span>
              </p>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-500">
                Three AI helpers for football. Public track records. Every
                decision logged. You pick Emma, Jack, or Tom — they handle the rest.
              </p>

              <div className="mt-6 flex w-full max-w-xs flex-col gap-2">
                <Link href="/allocate">
                  <Button variant="violet" size="pill" className="w-full justify-between">
                    Fund an agent
                    <ArrowRight01Icon size={13} />
                  </Button>
                </Link>
                <Link href="/agents">
                  <Button variant="outline" size="pill" className="w-full justify-between">
                    Meet the team
                    <ArrowUpRight01Icon size={13} />
                  </Button>
                </Link>
                <p className="pt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-zinc-600">
                  Submission · OKX X Cup · May 28 12:00 UTC
                </p>
              </div>
            </div>

            <div className="relative hidden min-h-[360px] overflow-hidden md:block lg:min-h-[420px]">
              <Image
                src="/brand/cta-manifesto-visual.png"
                alt=""
                fill
                className="object-cover object-right scale-110"
                sizes="(max-width: 1280px) 50vw, 640px"
              />
              <div className="absolute inset-y-0 left-0 w-24 bg-linear-to-r from-[#0B0B0E] to-transparent" />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
