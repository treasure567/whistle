import { LIVE_FEED_CHANNEL, type LiveEvent } from '@whistle/types';
import type { ApiFootballClient, Fixture } from '../clients/api-football.js';
import type { MatchRepository } from '../repositories/match.repo.js';

export type MatchCache = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  publish(channel: string, message: string): Promise<void>;
};

export type MatchIngestionDeps = {
  client: ApiFootballClient;
  matches: MatchRepository;
  cache: MatchCache;
  league: number;
  season: number;
};

export type SyncResult = { fixtures: number };
export type PollResult = { liveMatches: number; eventsPublished: number };

export type MatchIngestion = {
  syncFixtures(): Promise<SyncResult>;
  pollLive(): Promise<PollResult>;
};

const eventCountKey = (externalId: string) => `match:${externalId}:eventCount`;

export function createMatchIngestion(deps: MatchIngestionDeps): MatchIngestion {
  const { client, matches, cache, league, season } = deps;

  async function publishNewEvents(fixture: Fixture): Promise<number> {
    const key = eventCountKey(fixture.externalId);
    const seen = Number((await cache.get(key)) ?? '0');
    const events = await client.getFixtureEvents(fixture.externalId);
    const fresh = events.slice(seen);

    for (const event of fresh) {
      const liveEvent: LiveEvent = {
        matchExternalId: fixture.externalId,
        kind: event.kind,
        minute: event.minute,
        team: event.team,
        detail: event.detail,
        occurredAt: new Date().toISOString(),
      };
      await cache.publish(LIVE_FEED_CHANNEL, JSON.stringify(liveEvent));
    }

    if (events.length !== seen) {
      await cache.set(key, String(events.length));
    }
    return fresh.length;
  }

  return {
    async syncFixtures() {
      const fixtures = await client.getFixtures({ league, season });
      await matches.upsertMany(fixtures);
      return { fixtures: fixtures.length };
    },

    async pollLive() {
      const live = await client.getLiveFixtures({ league });
      if (live.length === 0) {
        return { liveMatches: 0, eventsPublished: 0 };
      }
      await matches.upsertMany(live);
      const counts = await Promise.all(live.map((fixture) => publishNewEvents(fixture)));
      return {
        liveMatches: live.length,
        eventsPublished: counts.reduce((sum, count) => sum + count, 0),
      };
    },
  };
}
