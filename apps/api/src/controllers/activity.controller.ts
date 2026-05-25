import type { Request, Response } from 'express';
import { ok } from '../http/respond.js';
import type { DecisionRepository } from '../repositories/decision.repo.js';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export type ActivityController = {
  list: (req: Request, res: Response) => Promise<void>;
};

export function createActivityController(decisions: DecisionRepository): ActivityController {
  return {
    list: async (req, res) => {
      const raw = Number(req.query.limit);
      const limit = Number.isInteger(raw) && raw > 0 ? Math.min(raw, MAX_LIMIT) : DEFAULT_LIMIT;
      ok(res, req, await decisions.recent(limit));
    },
  };
}
