import { randomBytes, timingSafeEqual } from 'node:crypto';
import type { Request, Response } from 'express';
import { Prisma } from '@whistle/db';
import { AppError, ErrorCode } from '@whistle/errors';
import { ok } from '../http/respond.js';
import { createLeagueBody, joinLeagueBody } from '../schemas/fantasy.schema.js';
import type { LeagueRepository } from '../repositories/league.repo.js';
import type { FantasyRepository } from '../repositories/fantasy.repo.js';

export type LeagueController = {
  create: (req: Request, res: Response) => Promise<void>;
  listPublic: (req: Request, res: Response) => Promise<void>;
  join: (req: Request, res: Response) => Promise<void>;
  leaderboard: (req: Request, res: Response) => Promise<void>;
};

const param = (value: string | string[] | undefined): string =>
  typeof value === 'string' ? value : '';

function tokenMatches(expected: string | null, provided: string | undefined): boolean {
  if (!expected || !provided) return false;
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createLeagueController(
  leagues: LeagueRepository,
  fantasy: FantasyRepository,
): LeagueController {
  return {
    create: async (req, res) => {
      const parsed = createLeagueBody.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(ErrorCode.VALIDATION, 'invalid league');
      }
      const accessToken = parsed.data.kind === 'PRIVATE' ? randomBytes(8).toString('hex') : null;
      const league = await leagues.create({
        name: parsed.data.name,
        kind: parsed.data.kind,
        ownerAddress: parsed.data.ownerAddress,
        maxBudgetMillions: parsed.data.maxBudgetMillions,
        transferDeadlineMinutes: parsed.data.transferDeadlineMinutes,
        accessToken,
      });
      ok(res, req, league);
    },

    listPublic: async (req, res) => {
      ok(res, req, await leagues.listPublic());
    },

    join: async (req, res) => {
      const leagueId = param(req.params.id);
      const parsed = joinLeagueBody.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(ErrorCode.VALIDATION, 'invalid join request');
      }
      const league = await leagues.getById(leagueId);
      if (!league) {
        throw new AppError(ErrorCode.NOT_FOUND, 'league not found');
      }
      if (league.kind === 'PRIVATE' && !tokenMatches(league.accessToken, parsed.data.accessToken)) {
        throw new AppError(ErrorCode.FORBIDDEN, 'invalid access token');
      }
      const team = await fantasy.getById(parsed.data.teamId);
      if (!team) {
        throw new AppError(ErrorCode.NOT_FOUND, 'team not found');
      }
      const cost = team.picks.reduce((sum, pick) => sum + Number(pick.player.priceMillions), 0);
      if (cost > Number(league.maxBudgetMillions)) {
        throw new AppError(ErrorCode.VALIDATION, 'team is over this league budget');
      }
      try {
        ok(res, req, await leagues.addEntry(leagueId, team.id));
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
          throw new AppError(ErrorCode.CONFLICT, 'team already in this league');
        }
        throw err;
      }
    },

    leaderboard: async (req, res) => {
      ok(res, req, await leagues.leaderboard(param(req.params.id)));
    },
  };
}
