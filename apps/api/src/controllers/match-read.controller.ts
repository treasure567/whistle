import type { Request, Response } from 'express';
import type { LlmClient } from '@whistle/agent-core';
import { AppError, ErrorCode } from '@whistle/errors';
import { ok } from '../http/respond.js';
import { matchChatBody, matchReadBody } from '../schemas/fantasy.schema.js';
import { matchChat, matchRead } from '../services/match-read.js';
import type { Redis } from '../redis.js';

export type MatchReadController = {
  read: (req: Request, res: Response) => Promise<void>;
  chat: (req: Request, res: Response) => Promise<void>;
};

// Pre-match reads are stable, so cache the LLM result per match and serve it to
// every visitor for a while instead of calling the model on each page load.
const READ_TTL_SECONDS = 60 * 60 * 6;

function readKey(home: string, away: string): string {
  return `match-read:v1:${home.trim().toLowerCase()}|${away.trim().toLowerCase()}`;
}

export function createMatchReadController(llm?: LlmClient, cache?: Redis): MatchReadController {
  return {
    read: async (req, res) => {
      const parsed = matchReadBody.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(ErrorCode.VALIDATION, 'home and away are required');
      }
      const { home, away } = parsed.data;
      const key = readKey(home, away);

      if (cache) {
        const hit = await cache.get(key).catch(() => null);
        if (hit) {
          try {
            ok(res, req, JSON.parse(hit));
            return;
          } catch {
            // stale/corrupt entry: fall through and regenerate
          }
        }
      }

      const result = await matchRead(home, away, llm);
      // Only cache real model output; let a heuristic fallback retry next time.
      if (cache && result.source === 'llm') {
        await cache.set(key, JSON.stringify(result), 'EX', READ_TTL_SECONDS).catch(() => undefined);
      }
      ok(res, req, result);
    },
    chat: async (req, res) => {
      const parsed = matchChatBody.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(ErrorCode.VALIDATION, 'invalid chat request');
      }
      ok(res, req, await matchChat(parsed.data.home, parsed.data.away, parsed.data.messages, llm));
    },
  };
}
