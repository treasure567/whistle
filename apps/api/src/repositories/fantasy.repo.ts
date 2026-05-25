import type { FantasyPick, FantasyTeam, League, LeagueEntry, Player, PrismaClient } from '@whistle/db';

export type PickInput = {
  playerId: string;
  starter: boolean;
  captain: boolean;
  viceCaptain: boolean;
  benchOrder: number | null;
};

export type CreateTeamInput = {
  ownerAddress: string;
  name: string;
  formation: string;
  picks: PickInput[];
};

export type UpdateTeamInput = {
  name: string;
  formation: string;
  picks: PickInput[];
};

export type TeamWithPicks = FantasyTeam & {
  picks: (FantasyPick & { player: Player })[];
  entries: (LeagueEntry & { league: League })[];
};

export type FantasyRepository = {
  createTeam(input: CreateTeamInput): Promise<FantasyTeam>;
  getByOwner(ownerAddress: string): Promise<TeamWithPicks | null>;
  getById(id: string): Promise<TeamWithPicks | null>;
  updateTeam(id: string, input: UpdateTeamInput): Promise<TeamWithPicks | null>;
};

export function createFantasyRepo(prisma: PrismaClient): FantasyRepository {
  return {
    createTeam: (input) =>
      prisma.fantasyTeam.create({
        data: {
          ownerAddress: input.ownerAddress,
          name: input.name,
          formation: input.formation,
          picks: {
            create: input.picks.map((pick) => ({
              playerId: pick.playerId,
              starter: pick.starter,
              captain: pick.captain,
              viceCaptain: pick.viceCaptain,
              benchOrder: pick.benchOrder,
            })),
          },
        },
      }),
    getByOwner: (ownerAddress) =>
      prisma.fantasyTeam.findFirst({
        where: { ownerAddress },
        orderBy: { createdAt: 'desc' },
        include: { picks: { include: { player: true } }, entries: { include: { league: true } } },
      }),
    getById: (id) =>
      prisma.fantasyTeam.findUnique({
        where: { id },
        include: { picks: { include: { player: true } }, entries: { include: { league: true } } },
      }),
    updateTeam: async (id, input) => {
      await prisma.$transaction([
        prisma.fantasyPick.deleteMany({ where: { teamId: id } }),
        prisma.fantasyTeam.update({
          where: { id },
          data: { name: input.name, formation: input.formation },
        }),
        prisma.fantasyPick.createMany({
          data: input.picks.map((pick) => ({
            teamId: id,
            playerId: pick.playerId,
            starter: pick.starter,
            captain: pick.captain,
            viceCaptain: pick.viceCaptain,
            benchOrder: pick.benchOrder,
          })),
        }),
      ]);
      return prisma.fantasyTeam.findUnique({
        where: { id },
        include: { picks: { include: { player: true } }, entries: { include: { league: true } } },
      });
    },
  };
}
