import type { Player, PlayerPosition, PrismaClient } from '@whistle/db';

export type PlayerRepository = {
  list(position?: PlayerPosition): Promise<Player[]>;
  byIds(ids: string[]): Promise<Player[]>;
};

export function createPlayerRepo(prisma: PrismaClient): PlayerRepository {
  return {
    list: (position) =>
      prisma.player.findMany({
        where: position ? { position } : {},
        orderBy: [{ position: 'asc' }, { priceMillions: 'desc' }],
        take: 1300,
      }),
    byIds: (ids) => prisma.player.findMany({ where: { id: { in: ids } } }),
  };
}
