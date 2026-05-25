import type { Agent, AgentKind, PrismaClient } from '@whistle/db';

export type AgentLookup = {
  getByKind(kind: AgentKind): Promise<Agent | null>;
  list(): Promise<Agent[]>;
};

export function createAgentRepo(prisma: PrismaClient): AgentLookup {
  return {
    getByKind: (kind) => prisma.agent.findUnique({ where: { kind } }),
    list: () => prisma.agent.findMany({ orderBy: { kind: 'asc' } }),
  };
}
