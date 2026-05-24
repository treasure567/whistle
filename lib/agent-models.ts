import type { AgentSlug } from "@/types";

export const AGENT_MODEL_URLS: Record<AgentSlug, string> = {
  scout: "/agents/models/scout.glb",
  bookie: "/agents/models/bookie.glb",
  manager: "/agents/models/manager.glb",
};

export const AGENT_MODEL_SCALE: Record<AgentSlug, number> = {
  scout: 1,
  bookie: 1,
  manager: 1,
};

export const AGENT_SLUGS: ReadonlyArray<AgentSlug> = [
  "scout",
  "bookie",
  "manager",
];

export const AGENT_DISPLAY: Record<
  AgentSlug,
  { name: string; accent: string }
> = {
  scout: { name: "Emma", accent: "#9CA3AF" },
  bookie: { name: "Jack", accent: "#F59E0B" },
  manager: { name: "Tom", accent: "#10B981" },
};
