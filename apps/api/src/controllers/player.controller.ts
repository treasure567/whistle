import type { Request, Response } from 'express';
import { AppError, ErrorCode } from '@whistle/errors';
import { ok } from '../http/respond.js';
import { playersQuery } from '../schemas/fantasy.schema.js';
import type { PlayerRepository } from '../repositories/player.repo.js';

export type PlayerController = {
  list: (req: Request, res: Response) => Promise<void>;
};

export function createPlayerController(players: PlayerRepository): PlayerController {
  return {
    list: async (req, res) => {
      const parsed = playersQuery.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(ErrorCode.BAD_REQUEST, 'invalid query');
      }
      ok(res, req, await players.list(parsed.data.position));
    },
  };
}
