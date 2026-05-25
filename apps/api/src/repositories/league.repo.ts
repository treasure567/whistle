import { Prisma, type League, type LeagueEntry, type LeagueKind, type PrismaClient } from '@whistle/db';

export type CreateLeagueInput = {
  name: string;
  kind: LeagueKind;
  ownerAddress: string;
  maxBudgetMillions: number;
  transferDeadlineMinutes: number;
  accessToken: string | null;
};

export type LeaderboardRow = {
  rank: number;
  teamId: string;
  teamName: string;
  ownerAddress: string;
  points: number;
};

export type LeagueRepository = {
  create(input: CreateLeagueInput): Promise<League>;
  listPublic(): Promise<League[]>;
  getById(id: string): Promise<League | null>;
  getByToken(token: string): Promise<League | null>;
  addEntry(leagueId: string, teamId: string): Promise<LeagueEntry>;
  leaderboard(leagueId: string): Promise<LeaderboardRow[]>;
};

export function createLeagueRepo(prisma: PrismaClient): LeagueRepository {
  return {
    create: (input) =>
      prisma.league.create({
        data: {
          name: input.name,
          kind: input.kind,
          ownerAddress: input.ownerAddress,
          maxBudgetMillions: new Prisma.Decimal(input.maxBudgetMillions),
          transferDeadlineMinutes: input.transferDeadlineMinutes,
          accessToken: input.accessToken,
        },
      }),
    listPublic: () =>
      prisma.league.findMany({ where: { kind: 'PUBLIC' }, orderBy: { createdAt: 'desc' }, take: 100 }),
    getById: (id) => prisma.league.findUnique({ where: { id } }),
    getByToken: (token) => prisma.league.findUnique({ where: { accessToken: token } }),
    addEntry: (leagueId, teamId) =>
      prisma.leagueEntry.create({ data: { leagueId, teamId } }),
    async leaderboard(leagueId) {
      const entries = await prisma.leagueEntry.findMany({
        where: { leagueId },
        orderBy: { points: 'desc' },
        include: { team: true },
        take: 1000,
      });
      return entries.map((entry, index) => ({
        rank: index + 1,
        teamId: entry.teamId,
        teamName: entry.team.name,
        ownerAddress: entry.team.ownerAddress,
        points: entry.points,
      }));
    },
  };
}
