import type { Request, Response } from 'express';
import type { LlmClient } from '@whistle/agent-core';
import { AppError, ErrorCode } from '@whistle/errors';
import { ok } from '../http/respond.js';
import { createPredictionBody, predictSlipBody } from '../schemas/fantasy.schema.js';
import type { PredictionRepository } from '../repositories/prediction.repo.js';
import type { MatchRepository } from '../repositories/match.repo.js';
import { buildSlip, type SlipCandidate } from '../services/predict-slip.js';

export type PredictionController = {
  create: (req: Request, res: Response) => Promise<void>;
  list: (req: Request, res: Response) => Promise<void>;
  slip: (req: Request, res: Response) => Promise<void>;
};

export function createPredictionController(
  predictions: PredictionRepository,
  matches: MatchRepository,
  llm?: LlmClient,
): PredictionController {
  return {
    create: async (req, res) => {
      const parsed = createPredictionBody.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(ErrorCode.VALIDATION, 'invalid prediction');
      }
      ok(res, req, await predictions.create(parsed.data));
    },
    list: async (req, res) => {
      const user = typeof req.query.user === 'string' ? req.query.user : '';
      if (!user) {
        throw new AppError(ErrorCode.BAD_REQUEST, 'a user address is required');
      }
      ok(res, req, await predictions.listByUser(user));
    },
    slip: async (req, res) => {
      const parsed = predictSlipBody.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(ErrorCode.VALIDATION, 'invalid slip request');
      }
      const now = new Date();
      const all = await matches.list(160);
      const candidates: SlipCandidate[] = all
        .filter((m) => m.externalId.startsWith('wc-') && m.kickoffAt > now)
        .slice(0, 28)
        .map((m) => {
          const payload = m.payload as { group?: string | null } | null;
          return {
            externalId: m.externalId,
            homeCode: m.homeCode,
            awayCode: m.awayCode,
            group: payload?.group ?? null,
          };
        });
      const slip = await buildSlip(candidates, parsed.data, llm);
      ok(res, req, slip);
    },
  };
}
