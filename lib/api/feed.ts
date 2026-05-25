import { z } from "zod";
import type { Hex } from "viem";

import { ACTIVITY } from "@/lib/mock/activity";
import type { ActivityItem, ActivityKind, AgentSlug } from "@/types";
import { apiGet } from "./client";

const KIND = z.enum(["SCOUT", "BOOKIE", "MANAGER"]);

export const agentActivityEventSchema = z.object({
  agent: KIND,
  matchExternalId: z.string().nullable(),
  action: z.string(),
  summary: z.string(),
  status: z.enum(["pending", "submitted", "confirmed", "failed"]),
  txHash: z.string().nullable(),
  occurredAt: z.string(),
});
export type AgentActivityEvent = z.infer<typeof agentActivityEventSchema>;

const activityRowSchema = z.object({
  id: z.string(),
  agentKind: KIND,
  matchId: z.string().nullable(),
  action: z.unknown(),
  status: z.string(),
  txHash: z.string().nullable(),
  createdAt: z.string(),
});
const activityRowsSchema = z.array(activityRowSchema);

const SLUG: Record<z.infer<typeof KIND>, AgentSlug> = {
  SCOUT: "scout",
  BOOKIE: "bookie",
  MANAGER: "manager",
};

function actionToKind(action: string): ActivityKind {
  if (action === "save_moment") return "mint";
  if (action === "place_bet") return "position-open";
  if (action === "set_lineup") return "roster-set";
  return "session-key";
}

export function eventToActivityItem(event: AgentActivityEvent): ActivityItem {
  return {
    id: `${event.agent}-${event.occurredAt}`,
    agent: SLUG[event.agent],
    kind: actionToKind(event.action),
    matchId: event.matchExternalId ?? "",
    matchLabel: event.matchExternalId ?? "live",
    matchMinute: null,
    txHash: (event.txHash ?? "0x") as Hex,
    blockNumber: 0,
    timestamp: Date.parse(event.occurredAt) || Date.now(),
    headline: event.summary,
    detail: `${event.action} (${event.status})`,
    outcome: "pending",
  };
}

export async function fetchActivity(): Promise<{ items: ActivityItem[]; source: "live" | "sample" }> {
  try {
    const rows = await apiGet("/activity", activityRowsSchema);
    if (rows.length === 0) {
      return { items: [...ACTIVITY], source: "sample" };
    }
    const items = rows.map<ActivityItem>((row) => {
      const action = row.action as { tool?: string; input?: Record<string, unknown> } | null;
      const tool = action?.tool ?? "skip";
      const headline =
        typeof action?.input?.headline === "string"
          ? action.input.headline
          : typeof action?.input?.market === "string"
            ? action.input.market
            : tool;
      return {
        id: row.id,
        agent: SLUG[row.agentKind],
        kind: actionToKind(tool),
        matchId: row.matchId ?? "",
        matchLabel: row.matchId ?? "live",
        matchMinute: null,
        txHash: (row.txHash ?? "0x") as Hex,
        blockNumber: 0,
        timestamp: Date.parse(row.createdAt) || Date.now(),
        headline,
        detail: `${tool} (${row.status})`,
        outcome: "pending",
      };
    });
    return { items, source: "live" };
  } catch {
    return { items: [...ACTIVITY], source: "sample" };
  }
}
