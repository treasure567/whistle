import { describe, expect, it } from 'vitest';
import { aiPick, type PickPlayer } from '../../src/services/ai-pick.js';
import type { Position } from '../../src/services/fantasy-rules.js';

const COUNTS: Record<Position, number> = { GK: 8, DEF: 16, MID: 16, FWD: 10 };
const TEAMS = ['ARG', 'BRA', 'FRA', 'ENG'];

function makePool(): PickPlayer[] {
  const pool: PickPlayer[] = [];
  for (const position of Object.keys(COUNTS) as Position[]) {
    for (let i = 0; i < COUNTS[position]; i += 1) {
      const team = TEAMS[i % TEAMS.length]!;
      pool.push({
        id: `${position}-${i}`,
        name: `${position} ${i}`,
        position,
        teamCode: team,
        nation: team,
        price: 4 + (i % 9), // 4.0 .. 12.0
      });
    }
  }
  return pool;
}

function assertValid(picks: { playerId: string; starter: boolean; captain: boolean }[], pool: PickPlayer[]) {
  expect(picks).toHaveLength(15);
  const byId = new Map(pool.map((p) => [p.id, p]));
  const counts: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  let starters = 0;
  let captains = 0;
  let cost = 0;
  for (const pick of picks) {
    const player = byId.get(pick.playerId)!;
    counts[player.position] += 1;
    if (pick.starter) starters += 1;
    if (pick.captain) {
      captains += 1;
      expect(pick.starter).toBe(true);
    }
    cost += player.price;
  }
  expect(counts).toEqual({ GK: 2, DEF: 5, MID: 5, FWD: 3 });
  expect(starters).toBe(11);
  expect(captains).toBe(1);
  expect(cost).toBeLessThanOrEqual(100);
}

describe('aiPick heuristic', () => {
  it('returns a valid, in-budget squad for each strength', async () => {
    const pool = makePool();
    for (const strength of ['balanced', 'galacticos', 'value', 'attacking', 'defensive'] as const) {
      const result = await aiPick(pool, { countries: [], strength, budget: 100 });
      expect(result.source).toBe('heuristic');
      assertValid(result.picks, pool);
    }
  });

  it('honours a country filter and still fills a legal squad', async () => {
    const pool = makePool();
    const result = await aiPick(pool, { countries: ['ARG'], strength: 'balanced', budget: 100 });
    assertValid(result.picks, pool);
  });

  it('respects a tight budget', async () => {
    const pool = makePool();
    const result = await aiPick(pool, { countries: [], strength: 'galacticos', budget: 70 });
    const byId = new Map(pool.map((p) => [p.id, p]));
    const cost = result.picks.reduce((sum, pick) => sum + byId.get(pick.playerId)!.price, 0);
    expect(cost).toBeLessThanOrEqual(70);
  });
});
