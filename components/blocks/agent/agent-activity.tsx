"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { ArrowRight01Icon } from "hugeicons-react";

import { ActivityRow, ActivityTableHeader } from "@/components/ui/activity-row";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import type { Agent, ActivityItem } from "@/types";

interface AgentActivityProps {
  agent: Agent;
  items?: ReadonlyArray<ActivityItem>;
}

export function AgentActivity({ agent, items: feed = [] }: AgentActivityProps) {
  const items = feed.filter((a) => a.agent === agent.slug).slice(0, 10);

  return (
    <section className="relative pb-20 md:pb-28">
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
              Recent decisions
            </span>
            <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight text-zinc-50 md:text-4xl">
              What {agent.name} did last.
            </h2>
          </div>
          <Link href={`/activity?agent=${agent.slug}`}>
            <Button variant="outline" size="pill">
              All {agent.name} decisions
              <ArrowRight01Icon size={14} />
            </Button>
          </Link>
        </motion.div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-[#0B0B0E]">
          {items.length === 0 ? (
            <EmptyState
              label={`${agent.name} idle`}
              hint="No decisions in window. Agent awakens at kickoff."
              className="border-0 rounded-none"
            />
          ) : (
            <>
              <ActivityTableHeader />
              {items.map((item, i) => (
                <ActivityRow key={item.id} item={item} index={i} />
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
