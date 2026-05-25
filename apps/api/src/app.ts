import express, { type Express, type RequestHandler } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import {
  requestIdMiddleware,
  healthRouter,
  readyRouter,
  metricsRouter,
  type ReadinessCheck,
} from '@whistle/observability';
import { httpLogger } from '@whistle/logger';
import { errorMiddleware, notFoundMiddleware } from '@whistle/errors';
import type { PrismaClient } from '@whistle/db';
import { createAgentRepo } from './repositories/agent.repo.js';
import { createMatchRepo } from './repositories/match.repo.js';
import { createAllocationRepo } from './repositories/allocation.repo.js';
import { createDecisionRepo } from './repositories/decision.repo.js';
import { createLeaderboardRepo } from './repositories/leaderboard.repo.js';
import { createPlayerRepo } from './repositories/player.repo.js';
import { createFantasyRepo } from './repositories/fantasy.repo.js';
import { createLeagueRepo } from './repositories/league.repo.js';
import { createPredictionRepo } from './repositories/prediction.repo.js';
import { createAgentController } from './controllers/agent.controller.js';
import { createMatchController } from './controllers/match.controller.js';
import { createAllocationController } from './controllers/allocation.controller.js';
import { createLeaderboardController } from './controllers/leaderboard.controller.js';
import { createActivityController } from './controllers/activity.controller.js';
import { createPlayerController } from './controllers/player.controller.js';
import { createFantasyController } from './controllers/fantasy.controller.js';
import { createLeagueController } from './controllers/league.controller.js';
import { createPredictionController } from './controllers/prediction.controller.js';
import { createMatchReadController } from './controllers/match-read.controller.js';
import { createRouter } from './routes/index.js';
import { requireServiceAuth } from './http/service-auth.js';
import { createOpenAiClient, type LlmClient } from '@whistle/agent-core';
import type { Redis } from './redis.js';

export type AppDeps = {
  prisma: PrismaClient;
  feedHandler?: RequestHandler;
  corsOrigin?: string;
  serviceAuthSecret?: string;
  readinessChecks?: ReadinessCheck[];
  rateLimit?: { windowMs: number; max: number };
  llm?: { apiKey: string; model: string; baseUrl?: string };
  cache?: Redis;
};

function resolveCorsOrigin(origin: string | undefined): string | string[] {
  if (!origin || origin === '*') {
    return '*';
  }
  return origin.split(',').map((value) => value.trim());
}

const feedUnavailable: RequestHandler = (_req, res) => {
  res.status(503).json({ ok: false, code: 'INTERNAL', message: 'live feed unavailable' });
};

export async function createApp(deps: AppDeps): Promise<Express> {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: resolveCorsOrigin(deps.corsOrigin) }));
  app.use(requestIdMiddleware);
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());
  app.use(httpLogger);

  app.use('/healthz', healthRouter());
  app.use('/readyz', readyRouter(deps.readinessChecks ?? []));
  app.use('/metrics', metricsRouter());

  const limiter = rateLimit({
    windowMs: deps.rateLimit?.windowMs ?? 60_000,
    max: deps.rateLimit?.max ?? 120,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const playerRepo = createPlayerRepo(deps.prisma);
  const fantasyRepo = createFantasyRepo(deps.prisma);
  const leagueRepo = createLeagueRepo(deps.prisma);
  const matchRepo = createMatchRepo(deps.prisma);

  const llm: LlmClient | undefined = deps.llm
    ? createOpenAiClient({
        apiKey: deps.llm.apiKey,
        model: deps.llm.model,
        ...(deps.llm.baseUrl ? { baseUrl: deps.llm.baseUrl } : {}),
      })
    : undefined;

  const router = createRouter({
    agent: createAgentController(createAgentRepo(deps.prisma)),
    match: createMatchController(matchRepo),
    allocation: createAllocationController(
      createAllocationRepo(deps.prisma),
      createAgentRepo(deps.prisma),
    ),
    leaderboard: createLeaderboardController(createLeaderboardRepo(deps.prisma)),
    activity: createActivityController(createDecisionRepo(deps.prisma)),
    player: createPlayerController(playerRepo),
    fantasy: createFantasyController(playerRepo, fantasyRepo, leagueRepo, matchRepo, llm),
    league: createLeagueController(leagueRepo, fantasyRepo),
    prediction: createPredictionController(createPredictionRepo(deps.prisma), matchRepo, llm),
    matchRead: createMatchReadController(llm, deps.cache),
    feed: deps.feedHandler ?? feedUnavailable,
  });
  app.use('/v1', limiter, requireServiceAuth(deps.serviceAuthSecret), router);

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
