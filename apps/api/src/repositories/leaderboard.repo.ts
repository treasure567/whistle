import type { PrismaClient } from '@whistle/db';

export type LeaderboardRow = {
  kind: string;
  name: string;
  decisions: number;
  allocatedUsdt: string;
};

export type LeaderboardRepository = {
  rows(): Promise<LeaderboardRow[]>;
};

export function createLeaderboardRepo(prisma: PrismaClient): LeaderboardRepository {
  return {
    async rows() {
      const [agents, decisionCounts, allocationSums] = await Promise.all([
        prisma.agent.findMany({ orderBy: { kind: 'asc' } }),
        prisma.decision.groupBy({ by: ['agentId'], _count: { _all: true } }),
        prisma.allocation.groupBy({ by: ['agentId'], _sum: { amount: true } }),
      ]);

      const counts = new Map(decisionCounts.map((row) => [row.agentId, row._count._all]));
      const sums = new Map(allocationSums.map((row) => [row.agentId, row._sum.amount]));

      return agents
        .map((agent) => ({
          kind: agent.kind,
          name: agent.name,
          decisions: counts.get(agent.id) ?? 0,
          allocatedUsdt: (sums.get(agent.id) ?? null)?.toString() ?? '0',
        }))
        .sort((a, b) => b.decisions - a.decisions);
    },
  };
}
