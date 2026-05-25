import type { Request, Response } from 'express';
import { AppError, ErrorCode } from '@whistle/errors';
import { ok } from '../http/respond.js';
import { createPredictionBody } from '../schemas/fantasy.schema.js';
import type { PredictionRepository } from '../repositories/prediction.repo.js';

export type PredictionController = {
  create: (req: Request, res: Response) => Promise<void>;
  list: (req: Request, res: Response) => Promise<void>;
};

export function createPredictionController(predictions: PredictionRepository): PredictionController {
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
  };
}
