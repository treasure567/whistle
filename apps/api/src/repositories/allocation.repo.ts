import type { Allocation, PrismaClient } from '@whistle/db';

export type CreateAllocationInput = {
  agentId: string;
  userAddress: string;
  amount: string;
  asset: string;
};

export type AllocationRepository = {
  create(input: CreateAllocationInput): Promise<Allocation>;
  listByUser(userAddress: string): Promise<Allocation[]>;
};

export function createAllocationRepo(prisma: PrismaClient): AllocationRepository {
  return {
    create: (input) =>
      prisma.allocation.create({
        data: {
          agentId: input.agentId,
          userAddress: input.userAddress,
          amount: input.amount,
          asset: input.asset,
        },
      }),
    listByUser: (userAddress) =>
      prisma.allocation.findMany({ where: { userAddress }, orderBy: { createdAt: 'desc' } }),
  };
}
