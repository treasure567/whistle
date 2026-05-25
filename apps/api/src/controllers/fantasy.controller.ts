import type { Request, Response } from 'express';
import { AppError, ErrorCode } from '@whistle/errors';
import { ok } from '../http/respond.js';
import { createTeamBody, updateTeamBody } from '../schemas/fantasy.schema.js';
import {
  validateSquad,
  type Position,
  type RuleConfig,
  type SquadPlayer,
} from '../services/fantasy-rules.js';
import type { PlayerRepository } from '../repositories/player.repo.js';
import type { FantasyRepository } from '../repositories/fantasy.repo.js';
import type { LeagueRepository } from '../repositories/league.repo.js';
import type { MatchRepository } from '../repositories/match.repo.js';

const DEFAULT_RULES: RuleConfig = { maxBudgetMillions: 100, squadSize: 15, startingSize: 11 };
const DEFAULT_DEADLINE_MINUTES = 60;

type SquadPick = { playerId: string; starter: boolean; captain: boolean };

async function buildSquad(players: PlayerRepository, picks: SquadPick[]): Promise<SquadPlayer[]> {
  const roster = await players.byIds(picks.map((pick) => pick.playerId));
  const byId = new Map(roster.map((player) => [player.id, player]));
  return picks.map((pick) => {
    const player = byId.get(pick.playerId);
    if (!player) {
      throw new AppError(ErrorCode.BAD_REQUEST, `unknown player: ${pick.playerId}`);
    }
    return {
      position: player.position as Position,
      priceMillions: Number(player.priceMillions),
      starter: pick.starter,
      captain: pick.captain,
    };
  });
}

export type FantasyController = {
  createTeam: (req: Request, res: Response) => Promise<void>;
  getTeam: (req: Request, res: Response) => Promise<void>;
  updateTeam: (req: Request, res: Response) => Promise<void>;
};

export function createFantasyController(
  players: PlayerRepository,
  fantasy: FantasyRepository,
  leagues: LeagueRepository,
  matches: MatchRepository,
): FantasyController {
  return {
    createTeam: async (req, res) => {
      const parsed = createTeamBody.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(ErrorCode.VALIDATION, 'invalid team');
      }
      const { ownerAddress, name, formation, leagueId, picks } = parsed.data;

      const squad = await buildSquad(players, picks);

      let rules = DEFAULT_RULES;
      if (leagueId) {
        const league = await leagues.getById(leagueId);
        if (!league) {
          throw new AppError(ErrorCode.NOT_FOUND, 'league not found');
        }
        if (league.kind === 'PRIVATE') {
          throw new AppError(ErrorCode.FORBIDDEN, 'join private leagues with an access code');
        }
        rules = {
          maxBudgetMillions: Number(league.maxBudgetMillions),
          squadSize: league.squadSize,
          startingSize: league.startingSize,
        };
      }

      const result = validateSquad(rules, squad);
      if (!result.valid) {
        throw new AppError(ErrorCode.VALIDATION, result.errors.join('; '));
      }

      const team = await fantasy.createTeam({
        ownerAddress,
        name,
        formation,
        picks: picks.map((pick) => ({
          playerId: pick.playerId,
          starter: pick.starter,
          captain: pick.captain,
          viceCaptain: pick.viceCaptain,
          benchOrder: pick.benchOrder,
        })),
      });
      if (leagueId) {
        await leagues.addEntry(leagueId, team.id);
      }
      ok(res, req, { id: team.id, costMillions: result.costMillions });
    },

    getTeam: async (req, res) => {
      const owner = typeof req.query.owner === 'string' ? req.query.owner : '';
      if (!owner) {
        throw new AppError(ErrorCode.BAD_REQUEST, 'an owner address is required');
      }
      const team = await fantasy.getByOwner(owner);
      if (!team) {
        throw new AppError(ErrorCode.NOT_FOUND, 'no team for this owner');
      }
      ok(res, req, team);
    },

    updateTeam: async (req, res) => {
      const id = typeof req.params.id === 'string' ? req.params.id : '';
      const parsed = updateTeamBody.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(ErrorCode.VALIDATION, 'invalid team');
      }
      const team = await fantasy.getById(id);
      if (!team) {
        throw new AppError(ErrorCode.NOT_FOUND, 'team not found');
      }

      const league = team.entries[0]?.league ?? null;
      const deadlineMinutes = league?.transferDeadlineMinutes ?? DEFAULT_DEADLINE_MINUTES;
      const nextKickoff = await matches.nextKickoff(new Date());
      if (nextKickoff) {
        const lockAt = nextKickoff.getTime() - deadlineMinutes * 60_000;
        if (Date.now() >= lockAt) {
          throw new AppError(ErrorCode.FORBIDDEN, 'transfer deadline passed');
        }
      }

      const rules = league
        ? {
            maxBudgetMillions: Number(league.maxBudgetMillions),
            squadSize: league.squadSize,
            startingSize: league.startingSize,
          }
        : DEFAULT_RULES;

      const squad = await buildSquad(players, parsed.data.picks);
      const result = validateSquad(rules, squad);
      if (!result.valid) {
        throw new AppError(ErrorCode.VALIDATION, result.errors.join('; '));
      }

      await fantasy.updateTeam(id, {
        name: parsed.data.name,
        formation: parsed.data.formation,
        picks: parsed.data.picks.map((pick) => ({
          playerId: pick.playerId,
          starter: pick.starter,
          captain: pick.captain,
          viceCaptain: pick.viceCaptain,
          benchOrder: pick.benchOrder,
        })),
      });
      ok(res, req, { id, costMillions: result.costMillions });
    },
  };
}
