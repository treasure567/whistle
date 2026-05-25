import type { Request, Response } from 'express';
import { ok } from '../http/respond.js';
import type { LeaderboardRepository } from '../repositories/leaderboard.repo.js';

export type LeaderboardController = {
  list: (req: Request, res: Response) => Promise<void>;
};

export function createLeaderboardController(
  leaderboard: LeaderboardRepository,
): LeaderboardController {
  return {
    list: async (req, res) => {
      ok(res, req, await leaderboard.rows());
    },
  };
}
