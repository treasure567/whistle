import { initTelemetry } from '@whistle/observability';

const SERVICE_NAME = 'agents';
initTelemetry(SERVICE_NAME);

import { createApp } from './app.js';
import { loadEnv } from './config.js';
import { createRedis } from './redis.js';
import { buildReadinessChecks } from './health-checks.js';
import { startScheduler } from './scheduler.js';
import { createApiFootballClient } from './clients/api-football.js';
import { createMatchRepo } from './repositories/match.repo.js';
import { createMatchIngestion, type MatchIngestion } from './services/match-ingestion.js';
import { createAgentRepo } from './repositories/agent.repo.js';
import { createDecisionRepo } from './repositories/decision.repo.js';
import { createAgentRunner, type AgentRunner } from './services/agent-runner.js';
import { AGENT_DEFINITIONS } from './agents/definitions.js';
import {
  createAnthropicClient,
  createOpenAiClient,
  createDualLlmClient,
  type LlmClient,
} from '@whistle/agent-core';
import { createPrismaClient } from '@whistle/db';
import { createLogger } from '@whistle/logger';

function buildLlmClient(env: ReturnType<typeof loadEnv>): LlmClient | undefined {
  const anthropic = env.ANTHROPIC_API_KEY
    ? createAnthropicClient({
        apiKey: env.ANTHROPIC_API_KEY,
        model: env.ANTHROPIC_MODEL,
        ...(env.ANTHROPIC_BASE_URL ? { baseUrl: env.ANTHROPIC_BASE_URL } : {}),
      })
    : undefined;
  const openai = env.OPENAI_API_KEY
    ? createOpenAiClient({
        apiKey: env.OPENAI_API_KEY,
        model: env.OPENAI_MODEL,
        ...(env.OPENAI_BASE_URL ? { baseUrl: env.OPENAI_BASE_URL } : {}),
      })
    : undefined;
  if (anthropic && openai) return createDualLlmClient(anthropic, openai);
  return anthropic ?? openai;
}

const log = createLogger(SERVICE_NAME);

process.on('unhandledRejection', (reason) => {
  log.error({ reason }, 'unhandled rejection');
});
process.on('uncaughtException', (err) => {
  log.error({ err }, 'uncaught exception');
  process.exit(1);
});

async function main() {
  const env = loadEnv();
  const prisma = createPrismaClient({ databaseUrl: env.DATABASE_URL });
  const redis = createRedis(env.REDIS_URL);
  const app = await createApp({ readinessChecks: buildReadinessChecks({ prisma, redis }) });

  let ingestion: MatchIngestion | undefined;
  if (env.API_FOOTBALL_KEY) {
    ingestion = createMatchIngestion({
      client: createApiFootballClient({
        baseUrl: env.API_FOOTBALL_BASE_URL,
        apiKey: env.API_FOOTBALL_KEY,
      }),
      matches: createMatchRepo(prisma),
      cache: {
        get: (key) => redis.get(key),
        set: async (key, value) => {
          await redis.set(key, value);
        },
        publish: async (channel, message) => {
          await redis.publish(channel, message);
        },
      },
      league: env.FOOTBALL_LEAGUE_ID,
      season: env.FOOTBALL_SEASON,
    });
  }

  const llm = buildLlmClient(env);
  let agentRunner: AgentRunner | undefined;
  if (llm) {
    agentRunner = createAgentRunner({
      llm,
      definitions: AGENT_DEFINITIONS,
      agents: createAgentRepo(prisma),
      decisions: createDecisionRepo(prisma),
      matches: createMatchRepo(prisma),
      publisher: {
        publish: async (channel, message) => {
          await redis.publish(channel, message);
        },
      },
    });
  }

  const scheduler = await startScheduler({
    log,
    ingestion,
    agentRunner,
    livePollMs: env.LIVE_POLL_MS,
    fixturesSyncMs: env.FIXTURES_SYNC_MS,
    agentTickMs: env.AGENT_TICK_MS,
  });

  const server = app.listen(env.PORT, '127.0.0.1', () => {
    log.info({ port: env.PORT }, 'listening on 127.0.0.1');
  });

  const shutdown = async (signal: string) => {
    log.info({ signal }, 'shutdown initiated');
    await scheduler.stop();
    await redis.quit().catch(() => undefined);
    await prisma.$disconnect().catch(() => undefined);
    server.close(() => {
      log.info({}, 'http server closed');
    });
    setTimeout(() => process.exit(0), 25_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
