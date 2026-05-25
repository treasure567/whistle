import { describe, expect, it } from 'vitest';
import { LIVE_FEED_CHANNEL } from '@whistle/types';
import { createMatchIngestion, type MatchCache } from '@/services/match-ingestion.js';
import type { ApiFootballClient, Fixture, FixtureEvent } from '@/clients/api-football.js';
import type { MatchRepository } from '@/repositories/match.repo.js';

function fixture(externalId: string, status: string): Fixture {
  return {
    externalId,
    homeCode: 'ARG',
    awayCode: 'FRA',
    kickoffAt: new Date('2026-06-11T16:00:00Z'),
    status,
    raw: { id: externalId },
  };
}

function fakeCache() {
  const store = new Map<string, string>();
  const published: { channel: string; message: string }[] = [];
  const cache: MatchCache = {
    get: async (key) => store.get(key) ?? null,
    set: async (key, value) => {
      store.set(key, value);
    },
    publish: async (channel, message) => {
      published.push({ channel, message });
    },
  };
  return { cache, store, published };
}

describe('match ingestion', () => {
  it('upserts every fetched fixture', async () => {
    const upserts: Fixture[] = [];
    const client: ApiFootballClient = {
      getFixtures: async () => [fixture('1', 'NS'), fixture('2', 'NS')],
      getLiveFixtures: async () => [],
      getFixtureEvents: async () => [],
    };
    const matches: MatchRepository = {
      upsertMany: async (fs) => {
        upserts.push(...fs);
      },
      listUpcoming: async () => [],
      listLive: async () => [],
    };
    const { cache } = fakeCache();

    const ingestion = createMatchIngestion({ client, matches, cache, league: 1, season: 2026 });
    const result = await ingestion.syncFixtures();

    expect(result.fixtures).toBe(2);
    expect(upserts).toHaveLength(2);
  });

  it('publishes only newly seen live events', async () => {
    const events: FixtureEvent[] = [
      { kind: 'goal', minute: 12, team: 'ARG', detail: 'Normal Goal' },
    ];
    const client: ApiFootballClient = {
      getFixtures: async () => [],
      getLiveFixtures: async () => [fixture('7', '1H')],
      getFixtureEvents: async () => events,
    };
    const matches: MatchRepository = {
      upsertMany: async () => {},
      listUpcoming: async () => [],
      listLive: async () => [],
    };
    const { cache, published } = fakeCache();
    const ingestion = createMatchIngestion({ client, matches, cache, league: 1, season: 2026 });

    const first = await ingestion.pollLive();
    expect(first.liveMatches).toBe(1);
    expect(first.eventsPublished).toBe(1);
    expect(published).toHaveLength(1);
    expect(published[0]?.channel).toBe(LIVE_FEED_CHANNEL);
    expect(JSON.parse(published[0]?.message ?? '{}')).toMatchObject({
      matchExternalId: '7',
      kind: 'goal',
      minute: 12,
    });

    const second = await ingestion.pollLive();
    expect(second.eventsPublished).toBe(0);
    expect(published).toHaveLength(1);

    events.push({ kind: 'card', minute: 40, team: 'FRA', detail: 'Yellow Card' });
    const third = await ingestion.pollLive();
    expect(third.eventsPublished).toBe(1);
    expect(published).toHaveLength(2);
  });
});
