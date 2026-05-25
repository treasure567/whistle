import type { Address, Hex } from "viem";

import { AGENTS } from "@/lib/mock/agents";
import type { Agent, AgentSlug } from "@/types";
import { apiGet } from "./client";
import { agentRecordsSchema, type AgentRecord } from "./schemas";

const KIND_TO_SLUG: Record<AgentRecord["kind"], AgentSlug> = {
  SCOUT: "scout",
  BOOKIE: "bookie",
  MANAGER: "manager",
};

const ORDER: ReadonlyArray<AgentSlug> = ["scout", "bookie", "manager"];

function enrich(record: AgentRecord): Agent {
  return {
    ...AGENTS[KIND_TO_SLUG[record.kind]],
    onchain: {
      registryId: record.registryId,
      ownerAddress: record.ownerAddress as Address,
      strategyHash: record.strategyHash as Hex,
    },
  };
}

export async function fetchAgents(): Promise<Agent[]> {
  try {
    const records = await apiGet("/agents", agentRecordsSchema);
    const bySlug = new Map(
      records.map((record) => [KIND_TO_SLUG[record.kind], enrich(record)] as const),
    );
    return ORDER.map((slug) => bySlug.get(slug) ?? AGENTS[slug]);
  } catch {
    return ORDER.map((slug) => AGENTS[slug]);
  }
}

export async function fetchAgent(slug: AgentSlug): Promise<Agent> {
  const agents = await fetchAgents();
  return agents.find((agent) => agent.slug === slug) ?? AGENTS[slug];
}
