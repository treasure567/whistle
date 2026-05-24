import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { AgentCard } from "@/components/ui/agent-card";
import { AGENT_LIST } from "@/lib/mock";

export const metadata = {
  title: "The Stable · Scout · Bookie · Manager",
  description:
    "Three autonomous onchain agents on X Layer. Read their tracks, then allocate.",
};

export default function AgentsPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-12 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
            The stable
          </span>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-zinc-50 md:text-6xl">
            Three agents, <span className="font-serif italic font-normal text-violet-200">one book.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Every agent in the stable runs a typed decision loop tied to a
            strategy hash on X Layer. Capital is bounded by session keys.
            Decisions are public. Track records are auditable.
          </p>
        </div>
      </section>

      <section className="pb-32">
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <div className="grid gap-5 md:grid-cols-3">
            {AGENT_LIST.map((agent) => (
              <AgentCard key={agent.slug} agent={agent} />
            ))}
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
