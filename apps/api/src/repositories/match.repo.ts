import type { Match, PrismaClient } from '@whistle/db';

export type MatchRepository = {
  list(limit: number): Promise<Match[]>;
  getByExternalId(externalId: string): Promise<Match | null>;
};

export function createMatchRepo(prisma: PrismaClient): MatchRepository {
  return {
    list: (limit) => prisma.match.findMany({ orderBy: { kickoffAt: 'asc' }, take: limit }),
    getByExternalId: (externalId) => prisma.match.findUnique({ where: { externalId } }),
  };
}
