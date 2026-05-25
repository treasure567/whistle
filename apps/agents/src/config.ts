import { defineEnv } from '@whistle/config';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'staging', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4001),
  DATABASE_URL: z.string().min(1),
  REDIS_URL: z.string().min(1),
  XLAYER_RPC_URL: z.string().url().optional(),
  XLAYER_CHAIN_ID: z.coerce.number().int().positive().default(196),
  AGENT_SIGNER_KEY: z.string().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_MODEL: z.string().default('claude-sonnet-4-5'),
  ANTHROPIC_BASE_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  OPENAI_BASE_URL: z.string().url().optional(),
  PINATA_JWT: z.string().optional(),
  PINATA_BASE_URL: z.string().url().optional(),
  AGENT_TICK_MS: z.coerce.number().int().positive().default(60_000),
  API_FOOTBALL_KEY: z.string().optional(),
  API_FOOTBALL_BASE_URL: z.string().url().default('https://v3.football.api-sports.io'),
  FOOTBALL_LEAGUE_ID: z.coerce.number().int().positive().default(1),
  FOOTBALL_SEASON: z.coerce.number().int().positive().default(2026),
  LIVE_POLL_MS: z.coerce.number().int().positive().default(30_000),
  FIXTURES_SYNC_MS: z.coerce.number().int().positive().default(3_600_000),
});

export type Env = z.infer<typeof schema>;
export const loadEnv = (): Env => defineEnv(schema);
