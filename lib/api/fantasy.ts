import { apiGet, apiPost, apiPut } from "./client";
import {
  aiPickResultSchema,
  createTeamResultSchema,
  fantasyTeamSchema,
  type AiPickResult,
  type CreateTeamResult,
  type FantasyTeamRecord,
} from "./schemas";

export type AiPickStrength =
  | "balanced"
  | "galacticos"
  | "value"
  | "attacking"
  | "defensive";

export type AiPickInput = {
  countries?: string[];
  strength: AiPickStrength;
  budget?: number;
  formation?: string;
};

export function aiPickSquad(input: AiPickInput): Promise<AiPickResult> {
  return apiPost("/fantasy/ai-pick", input, aiPickResultSchema);
}

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
