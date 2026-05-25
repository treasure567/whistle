import type { PrismaClient } from '@whistle/db';

export type ActivityItem = {
  id: string;
  agentKind: string;
  matchId: string | null;
  action: unknown;
  status: string;
  txHash: string | null;
  createdAt: Date;
};

export type DecisionRepository = {
  recent(limit: number): Promise<ActivityItem[]>;
};

export function createDecisionRepo(prisma: PrismaClient): DecisionRepository {
  return {
    async recent(limit) {
      const rows = await prisma.decision.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        include: { agent: { select: { kind: true } } },
      });
      return rows.map((row) => ({
        id: row.id,
        agentKind: row.agent.kind,
        matchId: row.matchId,
        action: row.action,
        status: row.status,
        txHash: row.txHash,
        createdAt: row.createdAt,
      }));
    },
  };
}
