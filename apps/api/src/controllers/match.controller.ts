import type { Request, Response } from 'express';
import { AppError, ErrorCode } from '@whistle/errors';
import { ok } from '../http/respond.js';
import { matchListQuery } from '../schemas/match.schema.js';
import type { MatchRepository } from '../repositories/match.repo.js';

export type MatchController = {
  list: (req: Request, res: Response) => Promise<void>;
  getByExternalId: (req: Request, res: Response) => Promise<void>;
};

export function createMatchController(matches: MatchRepository): MatchController {
  return {
    list: async (req, res) => {
      const parsed = matchListQuery.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(ErrorCode.BAD_REQUEST, 'invalid query');
      }
      ok(res, req, await matches.list(parsed.data.limit));
    },
    getByExternalId: async (req, res) => {
      const externalId = typeof req.params.externalId === 'string' ? req.params.externalId : '';
      const match = await matches.getByExternalId(externalId);
      if (!match) {
        throw new AppError(ErrorCode.NOT_FOUND, `match not found: ${externalId}`);
      }
      ok(res, req, match);
    },
  };
}
