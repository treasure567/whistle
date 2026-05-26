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

export const matchReadSchema = z.object({
  home: z.string(),
  away: z.string(),
  outcomes: z.array(z.object({ label: z.string(), pct: z.coerce.number() })),
  markets: z.array(z.object({ label: z.string(), lean: z.string(), note: z.string() })),
  summary: z.string(),
  suggestions: z.array(z.string()).default([]),
  source: z.enum(["llm", "heuristic"]),
});
export type MatchReadResult = z.infer<typeof matchReadSchema>;

export const matchChatReplySchema = z.object({
  reply: z.string(),
  suggestions: z.array(z.string()).default([]),
  source: z.enum(["llm", "heuristic"]),
});
export type MatchChatReply = z.infer<typeof matchChatReplySchema>;

export const simMatchEventSchema = z.object({
  minute: z.coerce.number(),
  type: z.enum([
    "kickoff",
    "goal",
    "chance",
    "save",
    "corner",
    "yellow",
    "red",
    "penalty-goal",
    "penalty-miss",
    "sub",
    "halftime",
    "fulltime",
  ]),
  side: z.enum(["home", "away", "neutral"]),
  player: z.string().optional(),
  text: z.string().optional(),
});

export const simMatchSchema = z.object({
  homeScore: z.coerce.number(),
  awayScore: z.coerce.number(),
  events: z.array(simMatchEventSchema),
  stats: z.object({
    possessionHome: z.coerce.number(),
    shotsHome: z.coerce.number(),
    shotsAway: z.coerce.number(),
    sotHome: z.coerce.number(),
    sotAway: z.coerce.number(),
    cornersHome: z.coerce.number(),
    cornersAway: z.coerce.number(),
    foulsHome: z.coerce.number(),
    foulsAway: z.coerce.number(),
    offsidesHome: z.coerce.number(),
    offsidesAway: z.coerce.number(),
  }),
  motm: z
    .object({ player: z.string(), side: z.enum(["home", "away"]), rating: z.coerce.number() })
    .nullable(),
  source: z.enum(["llm", "heuristic"]),
});
export type SimMatchPayload = z.infer<typeof simMatchSchema>;

export const managerBriefSchema = z.object({
  verdict: z.string(),
  opponentRead: z.string(),
  suggestions: z.array(z.string()).default([]),
  suggestedFormation: z.string().optional(),
  suggestedChanges: z.array(z.object({ out: z.string(), in: z.string() })).default([]),
  source: z.enum(["llm", "heuristic"]),
});
export type ManagerBriefResult = z.infer<typeof managerBriefSchema>;

export const slipPickSchema = z.object({
  matchExternalId: z.string(),
  homeCode: z.string(),
  awayCode: z.string(),
  market: z.string(),
  side: z.string(),
  stake: z.coerce.number(),
  confidence: z.coerce.number(),
  note: z.string(),
});
export type SlipPick = z.infer<typeof slipPickSchema>;

export const slipSchema = z.object({
  picks: z.array(slipPickSchema),
  totalStake: z.coerce.number(),
  budget: z.coerce.number(),
  source: z.enum(["llm", "heuristic"]),
});
export type Slip = z.infer<typeof slipSchema>;

export const aiPickResultSchema = z.object({
  picks: z.array(
    z.object({
      playerId: z.string(),
      starter: z.boolean(),
      captain: z.boolean(),
    }),
  ),
  formation: z.string(),
  costMillions: z.coerce.number(),
  source: z.enum(["llm", "heuristic"]),
  rationale: z.string().optional(),
});
export type AiPickResult = z.infer<typeof aiPickResultSchema>;

export const agentLeaderboardRowSchema = z.object({
  kind: z.enum(["SCOUT", "BOOKIE", "MANAGER"]),
  name: z.string(),
  decisions: z.number(),
  allocatedUsdt: z.string(),
});
export type AgentLeaderboardRow = z.infer<typeof agentLeaderboardRowSchema>;
export const agentLeaderboardSchema = z.array(agentLeaderboardRowSchema);
