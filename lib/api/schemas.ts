import { z } from "zod";

export const agentRecordSchema = z.object({
  id: z.string(),
  kind: z.enum(["SCOUT", "BOOKIE", "MANAGER"]),
  name: z.string(),
  strategyHash: z.string(),
  ownerAddress: z.string(),
  registryId: z.number().nullable(),
});
export type AgentRecord = z.infer<typeof agentRecordSchema>;
export const agentRecordsSchema = z.array(agentRecordSchema);

export const matchPayloadSchema = z.object({
  group: z.string().nullable().optional(),
  stage: z.string().nullable().optional(),
  venue: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  matchNumber: z.number().optional(),
});

export const matchRecordSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  homeCode: z.string(),
  awayCode: z.string(),
  kickoffAt: z.string(),
  status: z.string(),
  payload: matchPayloadSchema.optional(),
});
export type MatchRecord = z.infer<typeof matchRecordSchema>;
export const matchRecordsSchema = z.array(matchRecordSchema);

export const playerPositionSchema = z.enum(["GK", "DEF", "MID", "FWD"]);
export type PlayerPositionValue = z.infer<typeof playerPositionSchema>;

export const playerRecordSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  name: z.string(),
  position: playerPositionSchema,
  nation: z.string(),
  teamCode: z.string(),
  priceMillions: z.coerce.number(),
  photo: z.string().nullable(),
});
export type PlayerRecord = z.infer<typeof playerRecordSchema>;
export const playerRecordsSchema = z.array(playerRecordSchema);

export const fantasyPickSchema = z.object({
  id: z.string(),
  playerId: z.string(),
  starter: z.boolean(),
  captain: z.boolean(),
  viceCaptain: z.boolean(),
  benchOrder: z.number().nullable(),
  player: playerRecordSchema,
});
export type FantasyPickRecord = z.infer<typeof fantasyPickSchema>;

export const fantasyTeamSchema = z.object({
  id: z.string(),
  ownerAddress: z.string(),
  name: z.string(),
  formation: z.string(),
  picks: z.array(fantasyPickSchema),
});
export type FantasyTeamRecord = z.infer<typeof fantasyTeamSchema>;

export const createTeamResultSchema = z.object({
  id: z.string(),
  costMillions: z.coerce.number(),
});
export type CreateTeamResult = z.infer<typeof createTeamResultSchema>;

export const leagueSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.enum(["PUBLIC", "PRIVATE"]),
  accessToken: z.string().nullable(),
  ownerAddress: z.string(),
  maxBudgetMillions: z.coerce.number(),
  squadSize: z.number(),
  startingSize: z.number(),
  transferDeadlineMinutes: z.number(),
  createdAt: z.string(),
});
export type LeagueRecord = z.infer<typeof leagueSchema>;
export const leaguesSchema = z.array(leagueSchema);

export const leagueEntrySchema = z.object({
  id: z.string(),
  leagueId: z.string(),
  teamId: z.string(),
  points: z.number(),
  joinedAt: z.string(),
});
export type LeagueEntryRecord = z.infer<typeof leagueEntrySchema>;

export const leaderboardRowSchema = z.object({
  rank: z.number(),
  teamId: z.string(),
  teamName: z.string(),
  ownerAddress: z.string(),
  points: z.number(),
});
export type LeaderboardRowRecord = z.infer<typeof leaderboardRowSchema>;
export const leaderboardSchema = z.array(leaderboardRowSchema);

export const predictionSchema = z.object({
  id: z.string(),
  ownerAddress: z.string(),
  matchExternalId: z.string(),
  market: z.string(),
  side: z.string(),
  stakeUsdt: z.coerce.number(),
  status: z.enum(["OPEN", "WON", "LOST"]),
  txHash: z.string().nullable(),
  createdAt: z.string(),
});
export type PredictionRecord = z.infer<typeof predictionSchema>;
export const predictionsSchema = z.array(predictionSchema);
