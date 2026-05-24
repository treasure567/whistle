"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight01Icon } from "hugeicons-react";

import { ActivityRow, ActivityTableHeader } from "@/components/ui/activity-row";
import { Button } from "@/components/ui/button";
import { RECENT_ACTIVITY } from "@/lib/mock";

export function ActivityPreview() {
  return (
    <section className="relative py-20 md:py-24">
      <div className="mx-auto max-w-7xl px-6 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-15%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"
        >
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
              Live feed
            </span>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-tight text-zinc-50 md:text-5xl">
              See what they&apos;re doing right now.
            </h2>
          </div>
          <Link href="/activity">
            <Button variant="outline" size="pill">
              Full activity
              <ArrowRight01Icon size={14} />
            </Button>
          </Link>
        </motion.div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0E]">
          <ActivityTableHeader />
          {RECENT_ACTIVITY.slice(0, 8).map((item, i) => (
            <ActivityRow key={item.id} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
