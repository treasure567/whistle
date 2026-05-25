import type { JsonSchema, LlmClient } from '@whistle/agent-core';

export type SlipCandidate = {
  externalId: string;
  homeCode: string;
  awayCode: string;
  group: string | null;
};

export type SlipCriteria = {
  budget: number;
  preferences?: string | undefined;
  risk?: string | undefined;
  count?: number | undefined;
};

export type SlipPick = {
  matchExternalId: string;
  homeCode: string;
  awayCode: string;
  market: string;
  side: string;
  stake: number;
  confidence: number;
  note: string;
};

export type Slip = {
  picks: SlipPick[];
  totalStake: number;
  budget: number;
  source: 'llm' | 'heuristic';
};

const SYSTEM =
  'You are Jack, a sharp World Cup bookmaker building a betting slip for a fan. You ' +
  'pick a handful of value selections that fit their brief and budget. You never ' +
  'guarantee results and you keep notes short.';

function clampCount(n: number | undefined): number {
  const c = Math.round(n ?? 5);
  return Math.max(2, Math.min(8, c));
}

function fitBudget(picks: SlipPick[], budget: number): { picks: SlipPick[]; totalStake: number } {
  const kept: SlipPick[] = [];
  let total = 0;
  for (const pick of picks) {
    const stake = Math.max(1, Math.round(pick.stake));
    if (total + stake > budget) continue;
    kept.push({ ...pick, stake });
    total += stake;
  }
  return { picks: kept, totalStake: total };
}

function heuristicSlip(candidates: SlipCandidate[], criteria: SlipCriteria): Slip {
  const count = Math.min(clampCount(criteria.count), candidates.length);
  const chosen = candidates.slice(0, count);
  const per = Math.max(1, Math.floor(criteria.budget / Math.max(count, 1)));
  const builders: ((c: SlipCandidate) => { market: string; side: string })[] = [
    (c) => ({ market: 'Match result', side: c.homeCode }),
    () => ({ market: 'Both teams to score', side: 'Yes' }),
    () => ({ market: 'Over/Under 2.5 goals', side: 'Over 2.5' }),
    (c) => ({ market: 'Double chance', side: `${c.homeCode} or draw` }),
  ];
  const picks: SlipPick[] = chosen.map((c, i) => {
    const m = builders[i % builders.length]!(c);
    return {
      matchExternalId: c.externalId,
      homeCode: c.homeCode,
      awayCode: c.awayCode,
      market: m.market,
      side: m.side,
      stake: per,
      confidence: 3,
      note: 'Balanced pick that fits your budget.',
    };
  });
  const fitted = fitBudget(picks, criteria.budget);
  return { picks: fitted.picks, totalStake: fitted.totalStake, budget: criteria.budget, source: 'heuristic' };
}

function slipTool(): { name: string; description: string; inputSchema: JsonSchema } {
  return {
    name: 'submit_slip',
    description: 'Submit a betting slip of selections that fit the budget.',
    inputSchema: {
      type: 'object',
      properties: {
        picks: {
          type: 'array',
          minItems: 2,
          maxItems: 8,
          items: {
            type: 'object',
            properties: {
              matchNum: { type: 'integer' },
              market: { type: 'string' },
              side: { type: 'string' },
              stake: { type: 'integer' },
              confidence: { type: 'integer' },
              note: { type: 'string' },
            },
            required: ['matchNum', 'market', 'side', 'stake'],
          },
        },
      },
      required: ['picks'],
    } as JsonSchema,
  };
}

export async function buildSlip(
  candidates: SlipCandidate[],
  criteria: SlipCriteria,
  llm?: LlmClient,
): Promise<Slip> {
  if (candidates.length === 0) {
    return { picks: [], totalStake: 0, budget: criteria.budget, source: 'heuristic' };
  }
  if (!llm) return heuristicSlip(candidates, criteria);

  const lines = candidates
    .map((c, i) => `${i + 1}. ${c.homeCode} vs ${c.awayCode}${c.group ? ` (Group ${c.group})` : ''}`)
    .join('\n');
  const count = clampCount(criteria.count);
  try {
    const call = await llm.decide({
      system: SYSTEM,
      prompt: [
        `Build a betting slip of about ${count} selections for a fan.`,
        `Total budget: ${criteria.budget} USDT. The sum of all stakes must be <= ${criteria.budget}.`,
        criteria.risk ? `Risk appetite: ${criteria.risk}.` : '',
        criteria.preferences ? `What they're looking for: ${criteria.preferences}.` : '',
        `Use markets like Match result (side = a team code or Draw), Double chance, ` +
          `Both teams to score (Yes/No), Over/Under 2.5 goals (Over 2.5 / Under 2.5).`,
        `Reference each match by its number. Give a confidence 1-5 and a short note per pick.`,
        `Matches:`,
        lines,
      ]
        .filter(Boolean)
        .join('\n'),
      tools: [slipTool()],
    });
    const input = call.input as { picks?: unknown };
    if (!Array.isArray(input.picks)) return heuristicSlip(candidates, criteria);
    const picks: SlipPick[] = [];
    for (const raw of input.picks) {
      if (typeof raw !== 'object' || raw === null) continue;
      const p = raw as Record<string, unknown>;
      const num = Number(p.matchNum);
      const candidate = Number.isInteger(num) && num >= 1 && num <= candidates.length ? candidates[num - 1] : undefined;
      const market = String(p.market ?? '').slice(0, 60);
      const side = String(p.side ?? '').slice(0, 40);
      const stake = Math.max(1, Math.round(Number(p.stake)) || 1);
      if (!candidate || !market || !side) continue;
      picks.push({
        matchExternalId: candidate.externalId,
        homeCode: candidate.homeCode,
        awayCode: candidate.awayCode,
        market,
        side,
        stake,
        confidence: Math.max(1, Math.min(5, Math.round(Number(p.confidence)) || 3)),
        note: typeof p.note === 'string' ? p.note.slice(0, 140) : 'Jack likes this one.',
      });
    }
    if (picks.length === 0) return heuristicSlip(candidates, criteria);
    const fitted = fitBudget(picks, criteria.budget);
    if (fitted.picks.length === 0) return heuristicSlip(candidates, criteria);
    return { picks: fitted.picks, totalStake: fitted.totalStake, budget: criteria.budget, source: 'llm' };
  } catch {
    return heuristicSlip(candidates, criteria);
  }
}
