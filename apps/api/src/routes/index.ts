import { Router, type RequestHandler } from 'express';
import type { AgentController } from '../controllers/agent.controller.js';
import type { MatchController } from '../controllers/match.controller.js';
import type { AllocationController } from '../controllers/allocation.controller.js';
import type { LeaderboardController } from '../controllers/leaderboard.controller.js';
import type { ActivityController } from '../controllers/activity.controller.js';

export type RouterDeps = {
  agent: AgentController;
  match: MatchController;
  allocation: AllocationController;
  leaderboard: LeaderboardController;
  activity: ActivityController;
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
  router.get('/feed', deps.feed);
  return router;
}
