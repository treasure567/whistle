"use client";

import { useEffect, useState } from "react";

import { AgentAvatar } from "@/components/ui/agent-avatar";
import { fetchActivity } from "@/lib/api/feed";
import { AGENTS } from "@/lib/mock";
import { truncateHash } from "@/lib/format";
import type { ActivityItem } from "@/types";

export function LiveTicker() {
  const [items, setItems] = useState<ActivityItem[]>([]);

  useEffect(() => {
    let active = true;
    fetchActivity()
      .then((r) => {
        if (active) setItems(r.items.slice(0, 12));
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  if (items.length === 0) return null;
  const doubled = [...items, ...items];

  return (
    <section className="relative overflow-hidden border-y border-white/5 bg-[#08080A] py-4">
      <div
        className="relative overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0, black 6%, black 94%, transparent 100%)",
        }}
      >
        <div className="flex w-max animate-marquee">
          {doubled.map((item, i) => {
            const agent = AGENTS[item.agent];
            const hasTx = item.txHash && item.txHash !== "0x";
            return (
              <div
                key={`${item.id}-${i}`}
                className="flex shrink-0 items-center gap-3 border-r border-white/[0.04] px-6 py-1 font-mono text-[11px] uppercase tracking-[0.18em]"
              >
                <AgentAvatar agent={item.agent} size={24} />
                <span className="text-zinc-500">{agent.name}</span>
                <span className="max-w-[22rem] truncate text-zinc-200">{item.headline}</span>
                {hasTx ? <span className="text-violet-300">{truncateHash(item.txHash, 4)}</span> : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
