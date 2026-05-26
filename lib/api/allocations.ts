import { z } from "zod";

import { apiPost } from "./client";
import type { AgentSlug } from "@/types";

const SLUG_TO_KIND: Record<AgentSlug, "SCOUT" | "BOOKIE" | "MANAGER"> = {
  scout: "SCOUT",
  bookie: "BOOKIE",
  manager: "MANAGER",
};

const allocationResultSchema = z.unknown();

// Record an onchain funding server-side so the leaderboard's "funded" total
// reflects real allocations. Fire-and-forget: the onchain allocate is the
// source of truth, so a failed record must never block funding.
export async function recordAllocation(slug: AgentSlug, userAddress: string, amountWei: string): Promise<void> {
  await apiPost(
    "/allocations",
    { kind: SLUG_TO_KIND[slug], userAddress, amount: amountWei, asset: "WHST" },
    allocationResultSchema,
  );
}
