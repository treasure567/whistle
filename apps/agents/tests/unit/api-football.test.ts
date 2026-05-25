import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiFootballClient } from '@/clients/api-football.js';

function jsonResponse(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body };
}

const fixturesBody = {
  response: [
    {
      fixture: { id: 215662, date: '2026-06-11T16:00:00+00:00', status: { short: 'NS' } },
      teams: { home: { name: 'Argentina', code: 'ARG' }, away: { name: 'France', code: 'FRA' } },
    },
  ],
};

describe('api-football client', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('parses fixtures into the domain shape', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse(fixturesBody)),
    );
    const client = createApiFootballClient({ baseUrl: 'https://api.test/', apiKey: 'k' });

    const fixtures = await client.getFixtures({ league: 1, season: 2026 });
    const [first] = fixtures;

    expect(fixtures).toHaveLength(1);
    expect(first?.externalId).toBe('215662');
    expect(first?.homeCode).toBe('ARG');
    expect(first?.awayCode).toBe('FRA');
    expect(first?.status).toBe('NS');
  });

  it('retries on 429 then succeeds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse({}, 429))
      .mockResolvedValueOnce(jsonResponse({ response: [] }, 200));
    vi.stubGlobal('fetch', fetchMock);
    const client = createApiFootballClient({
      baseUrl: 'https://api.test/',
      apiKey: 'k',
      retryBaseMs: 1,
    });

    const fixtures = await client.getFixtures({ league: 1, season: 2026 });

    expect(fixtures).toEqual([]);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('maps event types to live event kinds', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          response: [
            { time: { elapsed: 23 }, team: { name: 'Argentina' }, type: 'Goal', detail: 'Normal Goal' },
            { time: { elapsed: 67 }, team: { name: 'France' }, type: 'subst', detail: 'Substitution 1' },
          ],
        }),
      ),
    );
    const client = createApiFootballClient({ baseUrl: 'https://api.test/', apiKey: 'k' });

    const events = await client.getFixtureEvents('215662');

    expect(events).toEqual([
      { kind: 'goal', minute: 23, team: 'Argentina', detail: 'Normal Goal' },
      { kind: 'substitution', minute: 67, team: 'France', detail: 'Substitution 1' },
    ]);
  });
});
