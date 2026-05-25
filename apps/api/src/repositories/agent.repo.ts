import type { Agent, AgentKind, PrismaClient } from '@whistle/db';

export type AgentRepository = {
  list(): Promise<Agent[]>;
  getByKind(kind: AgentKind): Promise<Agent | null>;
};

export function createAgentRepo(prisma: PrismaClient): AgentRepository {
  return {
    list: () => prisma.agent.findMany({ orderBy: { kind: 'asc' } }),
    getByKind: (kind) => prisma.agent.findUnique({ where: { kind } }),
  };
}
