import { apiGet } from "./client";
import { agentLeaderboardSchema, type AgentLeaderboardRow } from "./schemas";

export type AgentLeaderboardFeed = {
  rows: AgentLeaderboardRow[];
  source: "live" | "empty";
};

export async function fetchAgentLeaderboard(): Promise<AgentLeaderboardFeed> {
  try {
    const rows = await apiGet("/leaderboard", agentLeaderboardSchema);
    return { rows, source: rows.length > 0 ? "live" : "empty" };
  } catch {
    return { rows: [], source: "empty" };
  }
}
