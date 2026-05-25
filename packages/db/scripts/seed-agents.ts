import { createHash } from 'node:crypto';
import { createPrismaClient } from '../src/index.js';

const strategyHash = (label: string) => `0x${createHash('sha256').update(label).digest('hex')}`;

const AGENTS = [
  { kind: 'SCOUT', name: 'The Scout', strategy: 'scout-v1' },
  { kind: 'BOOKIE', name: 'The Bookie', strategy: 'bookie-v1' },
  { kind: 'MANAGER', name: 'The Manager', strategy: 'manager-v1' },
] as const;

const ownerAddress =
  process.env.AGENT_OWNER_ADDRESS ?? '0x0000000000000000000000000000000000000000';

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to seed agents');
  }

  const prisma = createPrismaClient({ databaseUrl });
  try {
    for (const agent of AGENTS) {
      await prisma.agent.upsert({
        where: { kind: agent.kind },
        create: {
          kind: agent.kind,
          name: agent.name,
          strategyHash: strategyHash(agent.strategy),
          ownerAddress,
        },
        update: {
          name: agent.name,
          strategyHash: strategyHash(agent.strategy),
        },
      });
    }
    console.log(`seeded ${AGENTS.length} agents`);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
