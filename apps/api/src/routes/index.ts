import { Router, type RequestHandler } from 'express';
import type { AgentController } from '../controllers/agent.controller.js';
import type { MatchController } from '../controllers/match.controller.js';
import type { AllocationController } from '../controllers/allocation.controller.js';
import type { LeaderboardController } from '../controllers/leaderboard.controller.js';
import type { ActivityController } from '../controllers/activity.controller.js';
import type { PlayerController } from '../controllers/player.controller.js';
import type { FantasyController } from '../controllers/fantasy.controller.js';
import type { LeagueController } from '../controllers/league.controller.js';
import type { PredictionController } from '../controllers/prediction.controller.js';
import type { MatchReadController } from '../controllers/match-read.controller.js';
import type { SimController } from '../controllers/sim.controller.js';
import type { ManagerController } from '../controllers/manager.controller.js';

export type RouterDeps = {
  agent: AgentController;
  match: MatchController;
  allocation: AllocationController;
  leaderboard: LeaderboardController;
  activity: ActivityController;
  player: PlayerController;
  fantasy: FantasyController;
  league: LeagueController;
  prediction: PredictionController;
  matchRead: MatchReadController;
  sim: SimController;
  manager: ManagerController;
  feed: RequestHandler;
};

export function createRouter(deps: RouterDeps): Router {
  const router = Router();
  router.get('/agents', deps.agent.list);
  router.get('/agents/:kind', deps.agent.getByKind);
  router.get('/matches', deps.match.list);
  router.get('/matches/:externalId', deps.match.getByExternalId);
  router.post('/allocations', deps.allocation.create);
  router.get('/allocations', deps.allocation.list);
  router.get('/leaderboard', deps.leaderboard.list);
  router.get('/activity', deps.activity.list);

  router.get('/players', deps.player.list);
  router.post('/fantasy/teams', deps.fantasy.createTeam);
  router.get('/fantasy/teams', deps.fantasy.getTeam);
  router.put('/fantasy/teams/:id', deps.fantasy.updateTeam);
  router.post('/fantasy/ai-pick', deps.fantasy.aiPick);
  router.post('/leagues', deps.league.create);
  router.get('/leagues', deps.league.listPublic);
  router.post('/leagues/:id/join', deps.league.join);
  router.get('/leagues/:id/leaderboard', deps.league.leaderboard);
  router.post('/predictions', deps.prediction.create);
  router.get('/predictions', deps.prediction.list);
  router.post('/predictions/slip', deps.prediction.slip);
  router.post('/matches/read', deps.matchRead.read);
  router.post('/matches/chat', deps.matchRead.chat);
  router.post('/sim/match', deps.sim.match);
  router.post('/manager/brief', deps.manager.brief);

  router.get('/feed', deps.feed);
  return router;
}
