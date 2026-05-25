import type { JsonSchema, LlmClient } from '@whistle/agent-core';

export type MatchOutcome = { label: string; pct: number };
export type MatchMarket = { label: string; lean: string; note: string };

export type MatchRead = {
  home: string;
  away: string;
  outcomes: MatchOutcome[];
  markets: MatchMarket[];
  summary: string;
  source: 'llm' | 'heuristic';
};

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

const SYSTEM =
  'You are Jack, a sharp, friendly football bookmaker for the World Cup. You read a ' +
  'match and talk through likely outcomes in plain, confident language. You never ' +
  'guarantee results and you keep it short.';

function normalise(home: number, draw: number, away: number): MatchOutcome[] {
  const clamp = (n: number) => (Number.isFinite(n) && n > 0 ? n : 0);
  let h = clamp(home);
  let d = clamp(draw);
  let a = clamp(away);
  const total = h + d + a;
  if (total <= 0) {
    h = 40;
    d = 28;
    a = 32;
  } else {
    h = Math.round((h / total) * 100);
    d = Math.round((d / total) * 100);
    a = 100 - h - d;
  }
  return [
    { label: 'Home win', pct: h },
    { label: 'Draw', pct: d },
    { label: 'Away win', pct: a },
  ];
}

function heuristicRead(home: string, away: string): MatchRead {
  return {
    home,
    away,
    outcomes: normalise(40, 28, 32),
    markets: [
      { label: 'Both teams to score', lean: 'Yes', note: 'Two sides that like to go forward.' },
      { label: 'Over 2.5 goals', lean: 'Lean over', note: 'Group games tend to open up late.' },
      { label: 'First to score', lean: 'Home', note: 'Early tempo usually favours the home name.' },
    ],
    summary: `${home} v ${away} looks tight on paper. I'd watch the first 20 minutes for who takes control.`,
    source: 'heuristic',
  };
}

function readTool(): { name: string; description: string; inputSchema: JsonSchema } {
  return {
    name: 'submit_read',
    description: "Submit Jack's read on the match.",
    inputSchema: {
      type: 'object',
      properties: {
        homePct: { type: 'integer' },
        drawPct: { type: 'integer' },
        awayPct: { type: 'integer' },
        markets: {
          type: 'array',
          minItems: 2,
          maxItems: 3,
          items: {
            type: 'object',
            properties: {
              label: { type: 'string' },
              lean: { type: 'string' },
              note: { type: 'string' },
            },
            required: ['label', 'lean', 'note'],
          },
        },
        summary: { type: 'string' },
      },
      required: ['homePct', 'drawPct', 'awayPct', 'markets', 'summary'],
    } as JsonSchema,
  };
}

export async function matchRead(home: string, away: string, llm?: LlmClient): Promise<MatchRead> {
  if (!llm) return heuristicRead(home, away);
  try {
    const call = await llm.decide({
      system: SYSTEM,
      prompt:
        `Read this World Cup match: ${home} (home) vs ${away} (away). ` +
        `Give win/draw/win percentages that sum to about 100, two or three betting ` +
        `markets with your lean and a one-line note each, and a punchy one or two ` +
        `sentence summary in your own voice. Submit via the tool.`,
      tools: [readTool()],
    });
    const input = call.input as {
      homePct?: unknown;
      drawPct?: unknown;
      awayPct?: unknown;
      markets?: unknown;
      summary?: unknown;
    };
    const markets = Array.isArray(input.markets)
      ? input.markets
          .filter((m): m is Record<string, unknown> => typeof m === 'object' && m !== null)
          .slice(0, 3)
          .map((m) => ({
            label: String(m.label ?? '').slice(0, 60),
            lean: String(m.lean ?? '').slice(0, 40),
            note: String(m.note ?? '').slice(0, 140),
          }))
          .filter((m) => m.label)
      : [];
    if (markets.length === 0 || typeof input.summary !== 'string') {
      return heuristicRead(home, away);
    }
    return {
      home,
      away,
      outcomes: normalise(Number(input.homePct), Number(input.drawPct), Number(input.awayPct)),
      markets,
      summary: input.summary.slice(0, 320),
      source: 'llm',
    };
  } catch {
    return heuristicRead(home, away);
  }
}

function replyTool(): { name: string; description: string; inputSchema: JsonSchema } {
  return {
    name: 'reply',
    description: "Reply to the user as Jack.",
    inputSchema: {
      type: 'object',
      properties: { text: { type: 'string' } },
      required: ['text'],
    } as JsonSchema,
  };
}

export async function matchChat(
  home: string,
  away: string,
  messages: ChatMessage[],
  llm?: LlmClient,
): Promise<{ reply: string; source: 'llm' | 'heuristic' }> {
  if (!llm) {
    return {
      reply: "I'm between matches right now. Check my read above and lock in your call when you're ready.",
      source: 'heuristic',
    };
  }
  const history = messages
    .slice(-8)
    .map((m) => `${m.role === 'user' ? 'Fan' : 'Jack'}: ${m.content}`)
    .join('\n');
  try {
    const call = await llm.decide({
      system: SYSTEM,
      prompt:
        `Match: ${home} (home) vs ${away} (away).\n` +
        `Conversation so far:\n${history}\n\n` +
        `Reply to the fan's latest message as Jack in two or three sentences. Submit via the reply tool.`,
      tools: [replyTool()],
    });
    const input = call.input as { text?: unknown };
    const text = typeof input.text === 'string' ? input.text.slice(0, 600) : '';
    if (!text) throw new Error('empty reply');
    return { reply: text, source: 'llm' };
  } catch {
    return {
      reply: "My line dropped for a second. Ask me again, or go with the read above.",
      source: 'heuristic',
    };
  }
}
