import type { JsonSchema, LlmClient } from '@whistle/agent-core';
import { createLogger } from '@whistle/logger';

const log = createLogger('sim-match');

export type SimMatchSide = 'home' | 'away' | 'neutral';
export type SimMatchEventType =
  | 'kickoff'
  | 'goal'
  | 'chance'
  | 'save'
  | 'corner'
  | 'yellow'
  | 'red'
  | 'penalty-goal'
  | 'penalty-miss'
  | 'sub'
  | 'halftime'
  | 'fulltime';

export type SimMatchEvent = {
  minute: number;
  type: SimMatchEventType;
  side: SimMatchSide;
  player?: string;
  text?: string;
};

export type SimMatchStats = {
  possessionHome: number;
  shotsHome: number;
  shotsAway: number;
  sotHome: number;
  sotAway: number;
  cornersHome: number;
  cornersAway: number;
  foulsHome: number;
  foulsAway: number;
  offsidesHome: number;
  offsidesAway: number;
};

export type SimMatchMotm = { player: string; side: 'home' | 'away'; rating: number } | null;

export type SimTeamInput = { code: string; name: string; strength: number; players: string[] };

export type SimMatch = {
  homeScore: number;
  awayScore: number;
  events: SimMatchEvent[];
  stats: SimMatchStats;
  motm: SimMatchMotm;
  source: 'llm' | 'heuristic';
};

const SYSTEM =
  'You are a realistic football match simulation engine for the 2026 World Cup. ' +
  'You produce a believable, varied minute-by-minute timeline for a single tie. ' +
  'You weigh the two squads by their strength rating and player quality, but real ' +
  'football is unpredictable, so favourites do not always win and scorelines vary ' +
  'widely (0-0, 1-0, 3-2, the occasional rout). You always use real player names ' +
  'from the provided squads for scorers, cards and key moments.';

const DYNAMIC_TYPES = new Set<SimMatchEventType>([
  'goal',
  'penalty-goal',
  'penalty-miss',
  'save',
  'chance',
  'corner',
  'yellow',
  'red',
  'sub',
]);

function matchTool(): { name: string; description: string; inputSchema: JsonSchema } {
  return {
    name: 'submit_match',
    description: 'Submit the simulated match timeline, stats and man of the match.',
    inputSchema: {
      type: 'object',
      properties: {
        events: {
          type: 'array',
          minItems: 6,
          maxItems: 30,
          description:
            'Notable moments in chronological order. Include exactly one goal or penalty-goal ' +
            'event for every goal scored. The scoreline is the count of those events.',
          items: {
            type: 'object',
            properties: {
              minute: { type: 'integer', minimum: 1, maximum: 90 },
              type: {
                type: 'string',
                enum: [
                  'goal',
                  'penalty-goal',
                  'penalty-miss',
                  'save',
                  'chance',
                  'corner',
                  'yellow',
                  'red',
                  'sub',
                ],
              },
              side: { type: 'string', enum: ['home', 'away'] },
              player: { type: 'string', description: 'Real player name involved, when relevant.' },
              text: { type: 'string', description: 'Short note, mainly for substitutions.' },
            },
            required: ['minute', 'type', 'side'],
          },
        },
        possessionHome: { type: 'integer', minimum: 30, maximum: 70 },
        shotsHome: { type: 'integer', minimum: 0, maximum: 35 },
        shotsAway: { type: 'integer', minimum: 0, maximum: 35 },
        sotHome: { type: 'integer', minimum: 0, maximum: 20 },
        sotAway: { type: 'integer', minimum: 0, maximum: 20 },
        cornersHome: { type: 'integer', minimum: 0, maximum: 16 },
        cornersAway: { type: 'integer', minimum: 0, maximum: 16 },
        foulsHome: { type: 'integer', minimum: 0, maximum: 26 },
        foulsAway: { type: 'integer', minimum: 0, maximum: 26 },
        offsidesHome: { type: 'integer', minimum: 0, maximum: 8 },
        offsidesAway: { type: 'integer', minimum: 0, maximum: 8 },
        motmPlayer: { type: 'string' },
        motmSide: { type: 'string', enum: ['home', 'away'] },
        motmRating: { type: 'number', minimum: 6, maximum: 10 },
      },
      required: [
        'events',
        'possessionHome',
        'shotsHome',
        'shotsAway',
        'sotHome',
        'sotAway',
        'cornersHome',
        'cornersAway',
        'motmPlayer',
        'motmSide',
        'motmRating',
      ],
    } as JsonSchema,
  };
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

function clampRating(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return 7.5;
  return Math.round(Math.max(6, Math.min(10, n)) * 10) / 10;
}

// Models sometimes label the side with a team code or name instead of
// home/away, which would otherwise drop every event. Map it back.
function resolveSide(raw: unknown, home: SimTeamInput, away: SimTeamInput): 'home' | 'away' | null {
  const v = String(raw ?? '').trim().toLowerCase();
  if (!v) return null;
  if (v === 'home' || v === home.code.toLowerCase() || v === home.name.toLowerCase()) return 'home';
  if (v === 'away' || v === away.code.toLowerCase() || v === away.name.toLowerCase()) return 'away';
  return null;
}

function pickName(...vals: unknown[]): string | undefined {
  for (const v of vals) {
    if (typeof v === 'string' && v.trim()) return v.trim().slice(0, 40);
  }
  return undefined;
}

function sanitizeEvents(raw: unknown, home: SimTeamInput, away: SimTeamInput): SimMatchEvent[] {
  if (!Array.isArray(raw)) return [];
  const out: SimMatchEvent[] = [];
  for (const item of raw) {
    if (typeof item !== 'object' || item === null) continue;
    const e = item as Record<string, unknown>;
    const type = String(e.type ?? '') as SimMatchEventType;
    if (!DYNAMIC_TYPES.has(type)) continue;
    const side = resolveSide(e.side ?? e.team, home, away);
    if (!side) continue;
    const minute = Math.round(Number(e.minute));
    if (!Number.isFinite(minute)) continue;
    const player = pickName(e.player, e.scorer);
    const text = typeof e.text === 'string' && e.text.trim() ? e.text.trim().slice(0, 120) : undefined;
    out.push({
      minute: Math.max(1, Math.min(90, minute)),
      type,
      side,
      ...(player ? { player } : {}),
      ...(text ? { text } : {}),
    });
  }
  out.sort((a, b) => a.minute - b.minute);
  return out;
}

function withBookends(events: SimMatchEvent[]): SimMatchEvent[] {
  const all: SimMatchEvent[] = [
    { minute: 0, type: 'kickoff', side: 'neutral' },
    ...events,
    { minute: 45, type: 'halftime', side: 'neutral' },
    { minute: 90, type: 'fulltime', side: 'neutral' },
  ];
  return all.sort((a, b) => a.minute - b.minute);
}

function goalsBy(events: SimMatchEvent[], side: 'home' | 'away'): number {
  return events.filter((e) => (e.type === 'goal' || e.type === 'penalty-goal') && e.side === side).length;
}

function deriveMotm(input: Record<string, unknown>, events: SimMatchEvent[]): SimMatchMotm {
  const side = input.motmSide === 'away' ? 'away' : input.motmSide === 'home' ? 'home' : null;
  const player = typeof input.motmPlayer === 'string' ? input.motmPlayer.trim().slice(0, 40) : '';
  if (side && player) return { side, player, rating: clampRating(input.motmRating) };

  // Fall back to the leading scorer from the timeline.
  const tally = new Map<string, { side: 'home' | 'away'; count: number }>();
  for (const e of events) {
    if ((e.type === 'goal' || e.type === 'penalty-goal') && e.player && e.side !== 'neutral') {
      const cur = tally.get(e.player) ?? { side: e.side, count: 0 };
      cur.count += 1;
      tally.set(e.player, cur);
    }
  }
  let best: SimMatchMotm = null;
  let top = 0;
  for (const [name, info] of tally) {
    if (info.count > top) {
      top = info.count;
      best = { player: name, side: info.side, rating: info.count >= 2 ? 9.2 : 8.3 };
    }
  }
  return best;
}

function buildStats(input: Record<string, unknown>, homeGoals: number, awayGoals: number): SimMatchStats {
  const possessionHome = clampInt(input.possessionHome, 30, 70, 50);
  let sotHome = Math.max(clampInt(input.sotHome, 0, 20, homeGoals + 2), homeGoals);
  let sotAway = Math.max(clampInt(input.sotAway, 0, 20, awayGoals + 2), awayGoals);
  const shotsHome = Math.max(clampInt(input.shotsHome, 0, 35, sotHome + 5), sotHome);
  const shotsAway = Math.max(clampInt(input.shotsAway, 0, 35, sotAway + 5), sotAway);
  sotHome = Math.min(sotHome, shotsHome);
  sotAway = Math.min(sotAway, shotsAway);
  return {
    possessionHome,
    shotsHome,
    shotsAway,
    sotHome,
    sotAway,
    cornersHome: clampInt(input.cornersHome, 0, 16, 4),
    cornersAway: clampInt(input.cornersAway, 0, 16, 4),
    foulsHome: clampInt(input.foulsHome, 0, 26, 10),
    foulsAway: clampInt(input.foulsAway, 0, 26, 10),
    offsidesHome: clampInt(input.offsidesHome, 0, 8, 1),
    offsidesAway: clampInt(input.offsidesAway, 0, 8, 1),
  };
}

function heuristicStub(): SimMatch {
  return {
    homeScore: 0,
    awayScore: 0,
    events: [],
    stats: {
      possessionHome: 50,
      shotsHome: 0,
      shotsAway: 0,
      sotHome: 0,
      sotAway: 0,
      cornersHome: 0,
      cornersAway: 0,
      foulsHome: 0,
      foulsAway: 0,
      offsidesHome: 0,
      offsidesAway: 0,
    },
    motm: null,
    source: 'heuristic',
  };
}

function squadLine(team: SimTeamInput): string {
  const names = team.players.slice(0, 14).filter(Boolean);
  return names.length ? names.join(', ') : 'squad unavailable';
}

export async function simulateMatchLlm(
  home: SimTeamInput,
  away: SimTeamInput,
  variant: number,
  llm?: LlmClient,
): Promise<SimMatch> {
  if (!llm) return heuristicStub();
  try {
    const call = await llm.decide({
      system: SYSTEM,
      prompt:
        `Simulate this World Cup tie.\n` +
        `Home: ${home.name} (${home.code}), strength ${home.strength.toFixed(2)} of 1. Squad: ${squadLine(home)}.\n` +
        `Away: ${away.name} (${away.code}), strength ${away.strength.toFixed(2)} of 1. Squad: ${squadLine(away)}.\n` +
        `This is simulation variant #${variant}: give a fresh, plausible outcome that differs from a typical result. ` +
        `Spread the events realistically across the 90 minutes, pick scorers from the squads, and keep the stats ` +
        `consistent with who controlled the game. Submit everything via the submit_match tool.`,
      tools: [matchTool()],
    });

    const input = call.input;
    const cleaned = sanitizeEvents(input.events, home, away);
    if (cleaned.length === 0) {
      log.warn(
        { home: home.code, away: away.code, rawEvents: Array.isArray(input.events) ? input.events.length : 0 },
        'sim-match: model returned no usable events, falling back to engine',
      );
      return heuristicStub();
    }

    const events = withBookends(cleaned);
    const homeScore = goalsBy(events, 'home');
    const awayScore = goalsBy(events, 'away');
    return {
      homeScore,
      awayScore,
      events,
      stats: buildStats(input, homeScore, awayScore),
      motm: deriveMotm(input, events),
      source: 'llm',
    };
  } catch (err) {
    log.warn(
      { home: home.code, away: away.code, err: err instanceof Error ? err.message : String(err) },
      'sim-match: model call failed, falling back to engine',
    );
    return heuristicStub();
  }
}
