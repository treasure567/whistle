import type { Request, Response } from 'express';
import type { LlmClient } from '@whistle/agent-core';
import { AppError, ErrorCode } from '@whistle/errors';
import { ok } from '../http/respond.js';
import { simMatchBody } from '../schemas/fantasy.schema.js';
import { simulateMatchLlm } from '../services/sim-match.js';
import type { Redis } from '../redis.js';

export type SimController = {
  match: (req: Request, res: Response) => Promise<void>;
};

// A given tie + variant always models the same match, so cache the LLM output
// and serve it instantly. Re-simulating bumps the variant for a fresh model run.
const MATCH_TTL_SECONDS = 60 * 60 * 24;

function matchKey(home: string, away: string, variant: number): string {
  return `sim-match:v1:${home.trim().toLowerCase()}|${away.trim().toLowerCase()}|${variant}`;
}

export function createSimController(llm?: LlmClient, cache?: Redis): SimController {
  return {
    match: async (req, res) => {
      const parsed = simMatchBody.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(ErrorCode.VALIDATION, 'home and away teams are required');
      }
      const { home, away, variant } = parsed.data;
      const key = matchKey(home.code, away.code, variant);

      if (cache) {
        const hit = await cache.get(key).catch(() => null);
        if (hit) {
          try {
            ok(res, req, JSON.parse(hit));
            return;
          } catch {
            // stale/corrupt entry: regenerate below
          }
        }
      }

      const result = await simulateMatchLlm(home, away, variant, llm);
      if (cache && result.source === 'llm') {
        await cache.set(key, JSON.stringify(result), 'EX', MATCH_TTL_SECONDS).catch(() => undefined);
      }
      ok(res, req, result);
    },
  };
}
