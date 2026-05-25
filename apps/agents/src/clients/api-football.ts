import { LiveEventKind } from '@whistle/types';
import {
  eventsResponseSchema,
  fixturesResponseSchema,
  type EventItem,
  type FixtureItem,
} from '../schemas/api-football.js';
import { MatchDataError, MatchDataErrorCode } from '../services/errors.js';

export type Fixture = {
  externalId: string;
  homeCode: string;
  awayCode: string;
  kickoffAt: Date;
  status: string;
  raw: unknown;
};

export type FixtureEvent = {
  kind: LiveEventKind;
  minute: number | null;
  team: string | null;
  detail: string | null;
};

export type ApiFootballClient = {
  getFixtures(params: { league: number; season: number }): Promise<Fixture[]>;
  getLiveFixtures(params: { league: number }): Promise<Fixture[]>;
  getFixtureEvents(fixtureId: string): Promise<FixtureEvent[]>;
};

export type ApiFootballOptions = {
  baseUrl: string;
  apiKey: string;
  timeoutMs?: number;
  maxRetries?: number;
  retryBaseMs?: number;
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function mapEventKind(type: string): LiveEventKind {
  switch (type.toLowerCase()) {
    case 'goal':
      return LiveEventKind.GOAL;
    case 'card':
      return LiveEventKind.CARD;
    case 'subst':
      return LiveEventKind.SUBSTITUTION;
    case 'var':
      return LiveEventKind.VAR;
    default:
      return LiveEventKind.STATUS;
  }
}

function toFixture(item: FixtureItem): Fixture {
  return {
    externalId: String(item.fixture.id),
    homeCode: item.teams.home.code ?? item.teams.home.name,
    awayCode: item.teams.away.code ?? item.teams.away.name,
    kickoffAt: new Date(item.fixture.date),
    status: item.fixture.status.short,
    raw: item,
  };
}

function toEvent(item: EventItem): FixtureEvent {
  return {
    kind: mapEventKind(item.type),
    minute: item.time.elapsed,
    team: item.team?.name ?? null,
    detail: item.detail ?? null,
  };
}

export function createApiFootballClient(options: ApiFootballOptions): ApiFootballClient {
  const timeoutMs = options.timeoutMs ?? 10_000;
  const maxRetries = options.maxRetries ?? 3;
  const retryBaseMs = options.retryBaseMs ?? 500;

  async function request(path: string, search: Record<string, string>): Promise<unknown> {
    const url = new URL(path, options.baseUrl);
    for (const [key, value] of Object.entries(search)) {
      url.searchParams.set(key, value);
    }

    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch(url, {
          headers: { 'x-apisports-key': options.apiKey },
          signal: AbortSignal.timeout(timeoutMs),
        });
        if (res.status === 429 || res.status >= 500) {
          lastError = new MatchDataError(
            MatchDataErrorCode.FETCH_FAILED,
            `api-football responded ${res.status}`,
          );
        } else if (!res.ok) {
          throw new MatchDataError(
            MatchDataErrorCode.FETCH_FAILED,
            `api-football responded ${res.status}`,
          );
        } else {
          return await res.json();
        }
      } catch (err) {
        lastError = err;
      }
      if (attempt < maxRetries) {
        await sleep(retryBaseMs * 2 ** attempt + Math.floor(Math.random() * retryBaseMs));
      }
    }
    throw lastError instanceof Error
      ? lastError
      : new MatchDataError(MatchDataErrorCode.FETCH_FAILED, 'api-football request failed');
  }

  function parseFixtures(json: unknown): Fixture[] {
    const parsed = fixturesResponseSchema.safeParse(json);
    if (!parsed.success) {
      throw new MatchDataError(MatchDataErrorCode.INVALID_RESPONSE, 'invalid fixtures payload');
    }
    return parsed.data.response.map(toFixture);
  }

  return {
    async getFixtures({ league, season }) {
      return parseFixtures(
        await request('fixtures', { league: String(league), season: String(season) }),
      );
    },
    async getLiveFixtures({ league }) {
      return parseFixtures(await request('fixtures', { league: String(league), live: 'all' }));
    },
    async getFixtureEvents(fixtureId) {
      const json = await request('fixtures/events', { fixture: fixtureId });
      const parsed = eventsResponseSchema.safeParse(json);
      if (!parsed.success) {
        throw new MatchDataError(MatchDataErrorCode.INVALID_RESPONSE, 'invalid events payload');
      }
      return parsed.data.response.map(toEvent);
    },
  };
}
