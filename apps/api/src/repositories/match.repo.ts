import type { Match, PrismaClient } from '@whistle/db';

export type MatchRepository = {
  list(limit: number): Promise<Match[]>;
  getByExternalId(externalId: string): Promise<Match | null>;
  nextKickoff(now: Date): Promise<Date | null>;
};

export function createMatchRepo(prisma: PrismaClient): MatchRepository {
  return {
    list: (limit) => prisma.match.findMany({ orderBy: { kickoffAt: 'asc' }, take: limit }),
    getByExternalId: (externalId) => prisma.match.findUnique({ where: { externalId } }),
    async nextKickoff(now) {
      const match = await prisma.match.findFirst({
        where: { kickoffAt: { gt: now } },
        orderBy: { kickoffAt: 'asc' },
        select: { kickoffAt: true },
      });
      return match?.kickoffAt ?? null;
    },
  };
}
