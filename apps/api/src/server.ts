import { initTelemetry } from '@whistle/observability';

const SERVICE_NAME = 'api';
initTelemetry(SERVICE_NAME);

import { createApp } from './app.js';
import { loadEnv } from './config.js';
import { buildReadinessChecks } from './health-checks.js';
import { createRedis } from './redis.js';
import { createLiveFeed } from './live-feed.js';
import { createPrismaClient } from '@whistle/db';
import { createLogger } from '@whistle/logger';

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
  const subscriber = createRedis(env.REDIS_URL);
  const cache = createRedis(env.REDIS_URL);
  const feed = createLiveFeed(subscriber);
  await feed.start().catch((err) => log.error({ err }, 'live feed subscription failed'));

  const app = await createApp({
    prisma,
    feedHandler: feed.handler,
    corsOrigin: env.CORS_ORIGIN,
    readinessChecks: buildReadinessChecks({ prisma }),
    rateLimit: { windowMs: env.RATE_LIMIT_WINDOW_MS, max: env.RATE_LIMIT_MAX },
    cache,
    ...(env.SERVICE_AUTH_SECRET ? { serviceAuthSecret: env.SERVICE_AUTH_SECRET } : {}),
    ...(env.OPENAI_API_KEY
      ? {
          llm: {
            apiKey: env.OPENAI_API_KEY,
            model: env.OPENAI_MODEL,
            ...(env.OPENAI_BASE_URL ? { baseUrl: env.OPENAI_BASE_URL } : {}),
          },
        }
      : {}),
  });

  const server = app.listen(env.PORT, '127.0.0.1', () => {
    log.info({ port: env.PORT }, 'listening on 127.0.0.1');
  });

  const shutdown = async (signal: string) => {
    log.info({ signal }, 'shutdown initiated');
    await feed.close().catch(() => undefined);
    await cache.quit().catch(() => undefined);
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
