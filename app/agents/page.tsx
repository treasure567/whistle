import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { AgentCard } from "@/components/ui/agent-card";
import { AGENT_LIST } from "@/lib/mock";

export const metadata = {
  title: "Emma · Jack · Tom",
  description:
    "Meet the three AI helpers behind Whistle. Read what each one does, then fund who you trust.",
};

export default function AgentsPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <section className="relative pt-[calc(4rem+3rem)] pb-12 md:pt-32">
        <AmbientGlow position="top" intensity="subtle" size={900} />
        <div className="mx-auto max-w-7xl px-6 md:px-10">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
            The team
          </span>
          <h1 className="mt-3 max-w-3xl text-balance text-4xl font-semibold leading-[1.05] tracking-tight text-zinc-50 md:text-6xl">
            Emma, Jack, <span className="font-serif italic font-normal text-violet-200">and Tom.</span>
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-zinc-400">
            Three AI helpers, each with one clear job. You set a spending limit.
            They work inside it. Every action is logged so you can see exactly
            what they did.
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
