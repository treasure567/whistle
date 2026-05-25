import type { PrismaClient } from '@whistle/db';
import type { ReadinessCheck } from '@whistle/observability';

export function buildReadinessChecks(deps: { prisma: PrismaClient }): ReadinessCheck[] {
  return [
    {
      name: 'db',
      check: async () => {
        await deps.prisma.$queryRaw`SELECT 1`;
        return true;
      },
    },
  ];
}
