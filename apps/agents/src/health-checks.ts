import type { PrismaClient } from '@whistle/db';
import type { ReadinessCheck } from '@whistle/observability';
import type { Redis } from './redis.js';

export function buildReadinessChecks(deps: { prisma: PrismaClient; redis: Redis }): ReadinessCheck[] {
  return [
    {
      name: 'db',
      check: async () => {
        await deps.prisma.$queryRaw`SELECT 1`;
        return true;
      },
    },
    {
      name: 'redis',
      check: async () => (await deps.redis.ping()) === 'PONG',
    },
  ];
}
