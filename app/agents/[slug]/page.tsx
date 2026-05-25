import { notFound } from "next/navigation";

import { SiteFooter } from "@/components/layout/site-footer";
import { SiteNavbar } from "@/components/layout/site-navbar";
import { AgentActivity } from "@/components/blocks/agent/agent-activity";
import { AgentHero } from "@/components/blocks/agent/agent-hero";
import { AgentSpec } from "@/components/blocks/agent/agent-spec";
import { AGENTS } from "@/lib/mock";
import { fetchAgent } from "@/lib/api/agents";
import type { AgentSlug } from "@/types";

const VALID: ReadonlyArray<AgentSlug> = ["scout", "bookie", "manager"];

export async function generateStaticParams() {
  return VALID.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isValid(slug)) return {};
  const agent = AGENTS[slug];
  return {
    title: `${agent.name} · ${agent.role}`,
    description: agent.tagline,
  };
}

function isValid(slug: string): slug is AgentSlug {
  return (VALID as ReadonlyArray<string>).includes(slug);
}

export default async function AgentDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!isValid(slug)) notFound();
  const agent = await fetchAgent(slug);

  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <SiteNavbar />
      <AgentHero agent={agent} />
      <AgentSpec agent={agent} />
      <AgentActivity agent={agent} />
      <SiteFooter />
    </main>
  );
}
