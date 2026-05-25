import { Prisma, type Prediction, type PrismaClient } from '@whistle/db';

export type CreatePredictionInput = {
  ownerAddress: string;
  matchExternalId: string;
  market: string;
  side: string;
  stakeUsdt: string;
  txHash?: string | undefined;
};

export type PredictionRepository = {
  create(input: CreatePredictionInput): Promise<Prediction>;
  listByUser(ownerAddress: string): Promise<Prediction[]>;
};

export function createPredictionRepo(prisma: PrismaClient): PredictionRepository {
  return {
    create: (input) =>
      prisma.prediction.create({
        data: {
          ownerAddress: input.ownerAddress,
          matchExternalId: input.matchExternalId,
          market: input.market,
          side: input.side,
          stakeUsdt: new Prisma.Decimal(input.stakeUsdt),
          txHash: input.txHash ?? null,
        },
      }),
    listByUser: (ownerAddress) =>
      prisma.prediction.findMany({
        where: { ownerAddress },
        orderBy: { createdAt: 'desc' },
        take: 200,
      }),
  };
}
