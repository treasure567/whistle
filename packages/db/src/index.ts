import { PrismaClient, Prisma } from '@prisma/client';

export type CreatePrismaClientOptions = {
  databaseUrl: string;
  logQueries?: boolean;
};

export function createPrismaClient(options: CreatePrismaClientOptions): PrismaClient {
  return new PrismaClient({
    datasources: { db: { url: options.databaseUrl } },
    log: options.logQueries ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });
}

export { PrismaClient, Prisma };
export type {
  Agent,
  Match,
  Allocation,
  Decision,
  AgentKind,
  DecisionStatus,
  Player,
  PlayerScore,
  PlayerPosition,
  FantasyTeam,
  FantasyPick,
  League,
  LeagueEntry,
  LeagueKind,
  Prediction,
  PredictionStatus,
} from '@prisma/client';
