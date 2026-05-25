import type { JsonSchema, LlmClient } from '@whistle/agent-core';

export type MatchOutcome = { label: string; pct: number };
export type MatchMarket = { label: string; lean: string; note: string };

export type MatchRead = {
  home: string;
  away: string;
  outcomes: MatchOutcome[];
  markets: MatchMarket[];
  summary: string;
  suggestions: string[];
  source: 'llm' | 'heuristic';
};

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

const SYSTEM =
  'You are Jack, a sharp, friendly football bookmaker for the World Cup. You read a ' +
  'match and talk through likely outcomes in plain, confident language. You never ' +
  'guarantee results and you keep it short.';

const DEFAULT_SUGGESTIONS = ["Who's your value pick?", 'Will both teams score?', 'Any cards to watch?'];
const DEFAULT_CHAT_SUGGESTIONS = ["What's the safest bet?", 'Could there be an upset?', 'How many goals?'];

function cleanSuggestions(value: unknown, fallback: string[]): string[] {
  if (!Array.isArray(value)) return fallback;
  const list = value
    .filter((v): v is string => typeof v === 'string')
    .map((s) => s.trim().slice(0, 60))
    .filter(Boolean)
    .slice(0, 4);
  return list.length > 0 ? list : fallback;
}

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
    suggestions: DEFAULT_SUGGESTIONS,
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
        suggestions: {
          type: 'array',
          minItems: 3,
          maxItems: 3,
          items: { type: 'string' },
          description: 'Three short follow-up questions a fan might ask about THIS match.',
        },
      },
      required: ['homePct', 'drawPct', 'awayPct', 'markets', 'summary', 'suggestions'],
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
        `markets with your lean and a one-line note each, a punchy one or two ` +
        `sentence summary in your own voice, and three short, specific follow-up ` +
        `questions a fan might ask about this exact match. Submit via the tool.`,
      tools: [readTool()],
    });
    const input = call.input as {
      homePct?: unknown;
      drawPct?: unknown;
      awayPct?: unknown;
      markets?: unknown;
      summary?: unknown;
      suggestions?: unknown;
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
      suggestions: cleanSuggestions(input.suggestions, DEFAULT_SUGGESTIONS),
      source: 'llm',
    };
  } catch {
    return heuristicRead(home, away);
  }
}

function replyTool(): { name: string; description: string; inputSchema: JsonSchema } {
  return {
    name: 'reply',
    description: 'Reply to the user as Jack and suggest follow-ups.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        suggestions: {
          type: 'array',
          minItems: 3,
          maxItems: 3,
          items: { type: 'string' },
          description: 'Three short follow-up questions that build on this reply.',
        },
      },
      required: ['text', 'suggestions'],
    } as JsonSchema,
  };
}

export async function matchChat(
  home: string,
  away: string,
  messages: ChatMessage[],
  llm?: LlmClient,
): Promise<{ reply: string; suggestions: string[]; source: 'llm' | 'heuristic' }> {
  if (!llm) {
    return {
      reply: "I'm between matches right now. Check my read above and lock in your call when you're ready.",
      suggestions: DEFAULT_CHAT_SUGGESTIONS,
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
        `Reply to the fan's latest message as Jack in two or three sentences, then ` +
        `suggest three short follow-up questions that build on your reply. Submit via the reply tool.`,
      tools: [replyTool()],
    });
    const input = call.input as { text?: unknown; suggestions?: unknown };
    const text = typeof input.text === 'string' ? input.text.slice(0, 600) : '';
    if (!text) throw new Error('empty reply');
    return { reply: text, suggestions: cleanSuggestions(input.suggestions, DEFAULT_CHAT_SUGGESTIONS), source: 'llm' };
  } catch {
    return {
      reply: 'My line dropped for a second. Ask me again, or go with the read above.',
      suggestions: DEFAULT_CHAT_SUGGESTIONS,
      source: 'heuristic',
    };
  }
}
