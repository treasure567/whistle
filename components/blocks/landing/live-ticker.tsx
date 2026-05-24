"use client";

import { RECENT_ACTIVITY, AGENTS } from "@/lib/mock";
import { truncateHash } from "@/lib/format";

export function LiveTicker() {
  const items = RECENT_ACTIVITY.slice(0, 10);
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
            return (
              <div
                key={`${item.id}-${i}`}
                className="flex shrink-0 items-center gap-3 border-r border-white/[0.04] px-6 py-1 font-mono text-[11px] uppercase tracking-[0.18em]"
              >
                <span className="text-zinc-500">{agent.glyph}</span>
                <span className="text-zinc-200">{item.headline}</span>
                <span className="text-zinc-600">{item.matchLabel}</span>
                <span className="text-violet-300">{truncateHash(item.txHash, 4)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
