import {
  EMPTY_PERFORMANCE,
  computeTeamPoints,
  scorePerformance,
  type PlayerPerformance,
  type Position,
} from '@whistle/scoring';
import { createPrismaClient } from '../src/index.js';

const GAMEWEEKS = 3;

function hashSeed(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRandom(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rollGoals(rand: () => number, firstGoalChance: number, secondGoalChance: number): number {
  if (rand() >= firstGoalChance) return 0;
  if (rand() < secondGoalChance) return 2;
  return 1;
}

function simulatePerformance(position: Position, rand: () => number): PlayerPerformance {
  const perf: PlayerPerformance = { ...EMPTY_PERFORMANCE };

  if (rand() < 0.15) {
    perf.minutes = Math.floor(rand() * 25);
    return perf;
  }

  perf.minutes = rand() < 0.8 ? 90 : 60 + Math.floor(rand() * 30);
  const kept = rand() < 0.4;

  if (position === 'GK') {
    perf.saves = 1 + Math.floor(rand() * 6);
    perf.cleanSheet = kept;
    perf.goalsConceded = kept ? 0 : 1 + Math.floor(rand() * 3);
    if (rand() < 0.04) perf.penaltiesSaved = 1;
  } else if (position === 'DEF') {
    perf.cleanSheet = kept;
    perf.goalsConceded = kept ? 0 : 1 + Math.floor(rand() * 3);
    perf.goals = rollGoals(rand, 0.08, 0.05);
    if (rand() < 0.12) perf.assists = 1;
  } else if (position === 'MID') {
    perf.cleanSheet = kept;
    perf.goals = rollGoals(rand, 0.22, 0.12);
    if (rand() < 0.25) perf.assists = 1;
  } else {
    perf.goals = rollGoals(rand, 0.45, 0.25);
    if (rand() < 0.2) perf.assists = 1;
  }

  if (rand() < 0.14) perf.yellowCards = 1;
  if (rand() < 0.02) perf.redCards = 1;
  if (rand() < 0.01) perf.ownGoals = 1;

  return perf;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to seed scoring');
  }

  const prisma = createPrismaClient({ databaseUrl });
  try {
    const players = await prisma.player.findMany();
    const scoreRows: { playerId: string; gameweek: number; points: number; minutes: number }[] = [];

    for (let gameweek = 1; gameweek <= GAMEWEEKS; gameweek += 1) {
      for (const player of players) {
        const rand = createRandom(hashSeed(`${player.externalId}:${gameweek}`));
        const perf = simulatePerformance(player.position, rand);
        const points = scorePerformance(player.position, perf);
        scoreRows.push({ playerId: player.id, gameweek, points, minutes: perf.minutes });
      }
    }

    await prisma.playerScore.deleteMany({});
    for (let i = 0; i < scoreRows.length; i += 500) {
      await prisma.playerScore.createMany({ data: scoreRows.slice(i, i + 500) });
    }
    const scoreCount = scoreRows.length;

    const scores = await prisma.playerScore.findMany();
    const pointsByPlayer: Record<string, number> = {};
    for (const score of scores) {
      pointsByPlayer[score.playerId] = (pointsByPlayer[score.playerId] ?? 0) + score.points;
    }

    const entries = await prisma.leagueEntry.findMany({
      include: { team: { include: { picks: true } } },
    });
    for (const entry of entries) {
      const picks = entry.team.picks.map((pick) => ({
        playerId: pick.playerId,
        starter: pick.starter,
        captain: pick.captain,
      }));
      const points = computeTeamPoints(picks, pointsByPlayer);
      await prisma.leagueEntry.update({ where: { id: entry.id }, data: { points } });
    }

    console.log(
      `seeded ${scoreCount} player scores across ${GAMEWEEKS} gameweeks; recomputed ${entries.length} league entries`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
