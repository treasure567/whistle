import { z } from 'zod';

const pickSchema = z.object({
  playerId: z.string().min(1),
  starter: z.boolean(),
  captain: z.boolean().default(false),
  viceCaptain: z.boolean().default(false),
  benchOrder: z.number().int().nullable().default(null),
});

export const createTeamBody = z.object({
  ownerAddress: z.string().min(1),
  name: z.string().min(1).max(60),
  formation: z.string().default('4-4-2'),
  leagueId: z.string().optional(),
  picks: z.array(pickSchema).min(1),
});

export const updateTeamBody = z.object({
  name: z.string().min(1).max(60),
  formation: z.string().default('4-4-2'),
  picks: z.array(pickSchema).min(1),
});

export const createLeagueBody = z.object({
  name: z.string().min(1).max(60),
  kind: z.enum(['PUBLIC', 'PRIVATE']).default('PUBLIC'),
  ownerAddress: z.string().min(1),
  maxBudgetMillions: z.number().positive().max(1000).default(100),
  transferDeadlineMinutes: z.number().int().nonnegative().max(10080).default(60),
});

export const joinLeagueBody = z.object({
  teamId: z.string().min(1),
  accessToken: z.string().optional(),
});

export const aiPickBody = z.object({
  countries: z.array(z.string().min(2).max(4)).max(48).optional(),
  strength: z.enum(['balanced', 'galacticos', 'value', 'attacking', 'defensive']).default('balanced'),
  budget: z.coerce.number().min(50).max(200).default(100),
  formation: z
    .string()
    .regex(/^\d-\d-\d$/)
    .optional(),
});

export const createPredictionBody = z.object({
  ownerAddress: z.string().min(1),
  matchExternalId: z.string().min(1),
  market: z.string().min(1).max(120),
  side: z.string().min(1).max(40),
  stakeUsdt: z.string().regex(/^\d+$/).default('0'),
  txHash: z.string().min(1).max(80).optional(),
});

export const playersQuery = z.object({
  position: z.enum(['GK', 'DEF', 'MID', 'FWD']).optional(),
});
