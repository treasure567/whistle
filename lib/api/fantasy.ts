import { apiGet, apiPost, apiPut } from "./client";
import {
  createTeamResultSchema,
  fantasyTeamSchema,
  type CreateTeamResult,
  type FantasyTeamRecord,
} from "./schemas";

export type TeamPickInput = {
  playerId: string;
  starter: boolean;
  captain: boolean;
};

export type CreateTeamInput = {
  ownerAddress: string;
  name: string;
  formation: string;
  leagueId?: string;
  picks: TeamPickInput[];
};

export type UpdateTeamInput = {
  name: string;
  formation: string;
  picks: TeamPickInput[];
};

export function createTeam(input: CreateTeamInput): Promise<CreateTeamResult> {
  return apiPost("/fantasy/teams", input, createTeamResultSchema);
}

export function updateTeam(id: string, input: UpdateTeamInput): Promise<CreateTeamResult> {
  return apiPut(`/fantasy/teams/${id}`, input, createTeamResultSchema);
}

export async function fetchTeam(owner: string): Promise<FantasyTeamRecord | null> {
  try {
    return await apiGet(`/fantasy/teams?owner=${owner}`, fantasyTeamSchema);
  } catch {
    return null;
  }
}
