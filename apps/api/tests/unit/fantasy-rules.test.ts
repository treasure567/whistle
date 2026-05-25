import { describe, expect, it } from 'vitest';
import { validateSquad, type Position, type SquadPlayer } from '@/services/fantasy-rules.js';

const RULES = { maxBudgetMillions: 100, squadSize: 15, startingSize: 11 };

function squad(): SquadPlayer[] {
  const make = (position: Position, count: number, starters: number, price: number): SquadPlayer[] =>
    Array.from({ length: count }, (_, i) => ({
      position,
      priceMillions: price,
      starter: i < starters,
      captain: false,
    }));
  const players = [
    ...make('GK', 2, 1, 5),
    ...make('DEF', 5, 4, 5),
    ...make('MID', 5, 4, 5),
    ...make('FWD', 3, 2, 7),
  ];
  const captain = players[0];
  if (captain) captain.captain = true;
  return players;
}

describe('validateSquad', () => {
  it('accepts a well-formed squad under budget', () => {
    const result = validateSquad(RULES, squad());
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.costMillions).toBe(2 * 5 + 5 * 5 + 5 * 5 + 3 * 7);
  });

  it('rejects an over-budget squad', () => {
    const players = squad().map((p) => ({ ...p, priceMillions: 10 }));
    const result = validateSquad(RULES, players);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('over budget'))).toBe(true);
  });

  it('rejects wrong composition', () => {
    const players = squad();
    const first = players[0];
    if (first) first.position = 'FWD';
    expect(validateSquad(RULES, players).valid).toBe(false);
  });

  it('rejects a squad with no captain', () => {
    const players = squad().map((p) => ({ ...p, captain: false }));
    expect(validateSquad(RULES, players).valid).toBe(false);
  });
});
