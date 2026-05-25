import { describe, expect, it } from 'vitest';
import type { LlmClient, LlmToolCall } from '@whistle/agent-core';
import { simulateMatchLlm, type SimTeamInput } from '../../src/services/sim-match.js';

const HOME: SimTeamInput = {
  code: 'ARG',
  name: 'Argentina',
  strength: 0.9,
  players: ['Messi', 'Alvarez', 'Mac Allister'],
};
const AWAY: SimTeamInput = {
  code: 'BRA',
  name: 'Brazil',
  strength: 0.85,
  players: ['Vinicius', 'Rodrygo', 'Casemiro'],
};

function mockLlm(input: Record<string, unknown>): LlmClient {
  return {
    provider: 'mock',
    async decide(): Promise<LlmToolCall> {
      return { tool: 'submit_match', input };
    },
  };
}

describe('simulateMatchLlm', () => {
  it('returns a heuristic stub when no llm is configured', async () => {
    const result = await simulateMatchLlm(HOME, AWAY, 0);
    expect(result.source).toBe('heuristic');
    expect(result.events).toHaveLength(0);
  });

  it('derives the score from goal events and injects bookends', async () => {
    const llm = mockLlm({
      events: [
        { minute: 12, type: 'goal', side: 'home', player: 'Messi' },
        { minute: 40, type: 'goal', side: 'home', player: 'Alvarez' },
        { minute: 77, type: 'penalty-goal', side: 'away', player: 'Vinicius' },
        { minute: 60, type: 'yellow', side: 'away', player: 'Casemiro' },
      ],
      possessionHome: 58,
      shotsHome: 14,
      shotsAway: 9,
      sotHome: 6,
      sotAway: 3,
      cornersHome: 7,
      cornersAway: 4,
      foulsHome: 9,
      foulsAway: 12,
      offsidesHome: 2,
      offsidesAway: 1,
      motmPlayer: 'Messi',
      motmSide: 'home',
      motmRating: 9.1,
    });
    const result = await simulateMatchLlm(HOME, AWAY, 1, llm);
    expect(result.source).toBe('llm');
    expect(result.homeScore).toBe(2);
    expect(result.awayScore).toBe(1);
    expect(result.events.some((e) => e.type === 'kickoff' && e.minute === 0)).toBe(true);
    expect(result.events.some((e) => e.type === 'halftime' && e.minute === 45)).toBe(true);
    expect(result.events.some((e) => e.type === 'fulltime' && e.minute === 90)).toBe(true);
    const minutes = result.events.map((e) => e.minute);
    expect(minutes).toEqual([...minutes].sort((a, b) => a - b));
    expect(result.motm).toEqual({ player: 'Messi', side: 'home', rating: 9.1 });
    expect(result.stats.sotHome).toBeLessThanOrEqual(result.stats.shotsHome);
  });

  it('maps event side given as a team code or name back to home/away', async () => {
    const llm = mockLlm({
      events: [
        { minute: 20, type: 'goal', side: 'ARG', player: 'Messi' },
        { minute: 55, type: 'goal', side: 'Brazil', scorer: 'Rodrygo' },
      ],
      possessionHome: 55,
      shotsHome: 10,
      shotsAway: 8,
      sotHome: 4,
      sotAway: 3,
      cornersHome: 5,
      cornersAway: 3,
      motmPlayer: 'Messi',
      motmSide: 'home',
      motmRating: 8.4,
    });
    const result = await simulateMatchLlm(HOME, AWAY, 2, llm);
    expect(result.source).toBe('llm');
    expect(result.homeScore).toBe(1);
    expect(result.awayScore).toBe(1);
    // alternate field "scorer" is picked up as the player
    expect(result.events.find((e) => e.minute === 55)?.player).toBe('Rodrygo');
  });

  it('falls back to a heuristic stub when the model returns no usable events', async () => {
    const llm = mockLlm({ events: 'not-an-array', possessionHome: 50 });
    const result = await simulateMatchLlm(HOME, AWAY, 0, llm);
    expect(result.source).toBe('heuristic');
  });

  it('clamps out-of-range stats and minutes', async () => {
    const llm = mockLlm({
      events: [{ minute: 200, type: 'goal', side: 'home', player: 'Messi' }],
      possessionHome: 999,
      shotsHome: -5,
      shotsAway: 100,
      sotHome: 50,
      sotAway: 0,
      cornersHome: 99,
      cornersAway: 0,
      motmPlayer: 'Messi',
      motmSide: 'home',
      motmRating: 50,
    });
    const result = await simulateMatchLlm(HOME, AWAY, 0, llm);
    expect(result.source).toBe('llm');
    expect(result.stats.possessionHome).toBeLessThanOrEqual(70);
    expect(result.stats.possessionHome).toBeGreaterThanOrEqual(30);
    expect(result.events.find((e) => e.type === 'goal')?.minute).toBe(90);
    expect(result.motm?.rating).toBeLessThanOrEqual(10);
  });
});
