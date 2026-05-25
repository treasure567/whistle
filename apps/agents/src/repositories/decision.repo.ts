import { Prisma, type Decision, type PrismaClient } from '@whistle/db';

export type RecordDecisionInput = {
  agentId: string;
  matchId: string | null;
  prompt: unknown;
  response: unknown;
  action: unknown;
};

export type DecisionRepository = {
  record(input: RecordDecisionInput): Promise<Decision>;
  markSubmitted(id: string, txHash: string): Promise<void>;
};

export function createDecisionRepo(prisma: PrismaClient): DecisionRepository {
  return {
    record: (input) =>
      prisma.decision.create({
        data: {
          agentId: input.agentId,
          matchId: input.matchId,
          prompt: input.prompt as Prisma.InputJsonValue,
          response: input.response as Prisma.InputJsonValue,
          action: input.action as Prisma.InputJsonValue,
        },
      }),
    markSubmitted: async (id, txHash) => {
      await prisma.decision.update({ where: { id }, data: { status: 'SUBMITTED', txHash } });
    },
  };
}
