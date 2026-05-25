import { describe, expect, it } from 'vitest';
import { EMPTY_PERFORMANCE, computeTeamPoints, scorePerformance } from '../../src/index.js';

describe('scorePerformance', () => {
  it('scores a forward brace with 90 minutes', () => {
    const points = scorePerformance('FWD', {
      ...EMPTY_PERFORMANCE,
      minutes: 90,
      goals: 2,
      assists: 1,
    });
    expect(points).toBe(2 + 2 * 4 + 3);
  });

  it('rewards a goalkeeper clean sheet, saves, and penalty save', () => {
    const points = scorePerformance('GK', {
      ...EMPTY_PERFORMANCE,
      minutes: 90,
      cleanSheet: true,
      saves: 6,
      penaltiesSaved: 1,
    });
    expect(points).toBe(2 + 4 + 2 + 5);
  });

  it('penalises a defender for goals conceded and a red card', () => {
    const points = scorePerformance('DEF', {
      ...EMPTY_PERFORMANCE,
      minutes: 90,
      goalsConceded: 4,
      redCards: 1,
    });
    expect(points).toBe(2 - 2 - 3);
  });

  it('returns zero for an unused player', () => {
    expect(scorePerformance('MID', EMPTY_PERFORMANCE)).toBe(0);
  });
});

describe('computeTeamPoints', () => {
  it('sums starters and doubles the captain, ignoring the bench', () => {
    const picks = [
      { playerId: 'a', starter: true, captain: true },
      { playerId: 'b', starter: true, captain: false },
      { playerId: 'c', starter: false, captain: false },
    ];
    const points = { a: 10, b: 5, c: 99 };
    expect(computeTeamPoints(picks, points)).toBe(10 * 2 + 5);
  });
});
