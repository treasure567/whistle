import { apiGet, apiPost } from "./client";
import {
  leaderboardSchema,
  leagueEntrySchema,
  leagueSchema,
  leaguesSchema,
  type LeaderboardRowRecord,
  type LeagueEntryRecord,
  type LeagueRecord,
} from "./schemas";

export type CreateLeagueInput = {
  name: string;
  kind: "PUBLIC" | "PRIVATE";
  ownerAddress: string;
  maxBudgetMillions: number;
  transferDeadlineMinutes: number;
};

export type JoinLeagueInput = {
  teamId: string;
  accessToken?: string;
};

export async function fetchPublicLeagues(): Promise<LeagueRecord[]> {
  try {
    return await apiGet("/leagues", leaguesSchema);
  } catch {
    return [];
  }
}

export function createLeague(input: CreateLeagueInput): Promise<LeagueRecord> {
  return apiPost("/leagues", input, leagueSchema);
}

export function joinLeague(id: string, input: JoinLeagueInput): Promise<LeagueEntryRecord> {
  return apiPost(`/leagues/${id}/join`, input, leagueEntrySchema);
}

export async function fetchLeaderboard(id: string): Promise<LeaderboardRowRecord[]> {
  try {
    return await apiGet(`/leagues/${id}/leaderboard`, leaderboardSchema);
  } catch {
    return [];
  }
}
