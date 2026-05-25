import { Prisma, type PrismaClient } from '@whistle/db';
import type { Fixture } from '../clients/api-football.js';

export type LiveMatch = {
  id: string;
  externalId: string;
  homeCode: string;
  awayCode: string;
  status: string;
  payload: unknown;
};

export type MatchRepository = {
  upsertMany(fixtures: Fixture[]): Promise<void>;
  listUpcoming(from: Date, limit?: number): Promise<{ externalId: string; kickoffAt: Date }[]>;
  listLive(): Promise<LiveMatch[]>;
};

const UPSERT_CHUNK = 100;
const LIVE_STATUSES = ['1H', '2H', 'HT', 'ET', 'P', 'LIVE'];

export function createMatchRepo(prisma: PrismaClient): MatchRepository {
  return {
    async upsertMany(fixtures) {
      for (let i = 0; i < fixtures.length; i += UPSERT_CHUNK) {
        const chunk = fixtures.slice(i, i + UPSERT_CHUNK);
        await prisma.$transaction(
          chunk.map((fixture) => {
            const payload = fixture.raw as Prisma.InputJsonValue;
            return prisma.match.upsert({
              where: { externalId: fixture.externalId },
              create: {
                externalId: fixture.externalId,
                homeCode: fixture.homeCode,
                awayCode: fixture.awayCode,
                kickoffAt: fixture.kickoffAt,
                status: fixture.status,
                payload,
              },
              update: {
                homeCode: fixture.homeCode,
                awayCode: fixture.awayCode,
                kickoffAt: fixture.kickoffAt,
                status: fixture.status,
                payload,
              },
            });
          }),
        );
      }
    },

    async listUpcoming(from, limit = 100) {
      return prisma.match.findMany({
        where: { kickoffAt: { gte: from } },
        orderBy: { kickoffAt: 'asc' },
        take: limit,
        select: { externalId: true, kickoffAt: true },
      });
    },

    async listLive() {
      return prisma.match.findMany({
        where: { status: { in: LIVE_STATUSES } },
        select: {
          id: true,
          externalId: true,
          homeCode: true,
          awayCode: true,
          status: true,
          payload: true,
        },
      });
    },
  };
}
