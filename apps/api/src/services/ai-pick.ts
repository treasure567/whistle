import type { JsonSchema, LlmClient } from '@whistle/agent-core';
import { validateSquad, type Position } from './fantasy-rules.js';

export type Strength = 'balanced' | 'galacticos' | 'value' | 'attacking' | 'defensive';

export type AiPickCriteria = {
  countries: string[];
  strength: Strength;
  budget: number;
  formation?: string | undefined;
};

export type PickPlayer = {
  id: string;
  name: string;
  position: Position;
  teamCode: string;
  nation: string;
  price: number;
};

export type AiSquadPick = { playerId: string; starter: boolean; captain: boolean };

export type AiPickResult = {
  picks: AiSquadPick[];
  formation: string;
  costMillions: number;
  source: 'llm' | 'heuristic';
  rationale?: string;
};

const COMPOSITION: Record<Position, number> = { GK: 2, DEF: 5, MID: 5, FWD: 3 };
const POSITIONS: Position[] = ['GK', 'DEF', 'MID', 'FWD'];

const SPEND_WEIGHT: Record<Strength, Record<Position, number>> = {
  balanced: { GK: 1, DEF: 2, MID: 3, FWD: 3 },
  galacticos: { GK: 1, DEF: 2, MID: 3, FWD: 4 },
  value: { GK: 1, DEF: 2, MID: 2, FWD: 2 },
  attacking: { GK: 1, DEF: 1, MID: 3, FWD: 4 },
  defensive: { GK: 2, DEF: 4, MID: 2, FWD: 1 },
};

const DEFAULT_FORMATION: Record<Strength, string> = {
  balanced: '4-4-2',
  galacticos: '4-3-3',
  value: '4-5-1',
  attacking: '3-4-3',
  defensive: '5-4-1',
};

const STARTERS_LIMIT: Record<Position, number> = { GK: 1, DEF: 5, MID: 5, FWD: 3 };

function parseFormation(value: string | undefined): { DEF: number; MID: number; FWD: number } | null {
  if (!value) return null;
  const parts = value.split('-').map((n) => Number(n));
  if (parts.length !== 3 || parts.some((n) => !Number.isInteger(n))) return null;
  const [DEF, MID, FWD] = parts as [number, number, number];
  if (DEF + MID + FWD !== 10) return null;
  if (DEF < 3 || DEF > 5 || MID < 2 || MID > 5 || FWD < 1 || FWD > 3) return null;
  return { DEF, MID, FWD };
}

function byPosition(pool: PickPlayer[]): Record<Position, PickPlayer[]> {
  const groups: Record<Position, PickPlayer[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const player of pool) groups[player.position].push(player);
  return groups;
}

/// Builds a candidate pool per position, preferring the chosen countries and
/// topping up from the full pool so a valid squad is always reachable.
function candidatePool(fullPool: PickPlayer[], countries: string[]): Record<Position, PickPlayer[]> {
  const preferred = countries.length
    ? fullPool.filter((p) => countries.includes(p.teamCode))
    : fullPool;
  const groups = byPosition(preferred);
  const fallback = byPosition(fullPool);
  for (const position of POSITIONS) {
    const want = COMPOSITION[position] + 6;
    if (groups[position].length < want) {
      const have = new Set(groups[position].map((p) => p.id));
      for (const player of fallback[position]) {
        if (have.has(player.id)) continue;
        groups[position].push(player);
        if (groups[position].length >= want) break;
      }
    }
    groups[position].sort((a, b) => a.price - b.price);
  }
  return groups;
}

function chooseStarters(selected: PickPlayer[], criteria: AiPickCriteria): Set<string> {
  const shape = parseFormation(criteria.formation) ?? parseFormation(DEFAULT_FORMATION[criteria.strength])!;
  const plan: Record<Position, number> = { GK: 1, DEF: shape.DEF, MID: shape.MID, FWD: shape.FWD };
  const groups = byPosition(selected);
  const starters = new Set<string>();
  for (const position of POSITIONS) {
    const ranked = [...groups[position]].sort((a, b) => b.price - a.price);
    for (const player of ranked.slice(0, Math.min(plan[position], STARTERS_LIMIT[position]))) {
      starters.add(player.id);
    }
  }
  return starters;
}

function assemble(selected: PickPlayer[], criteria: AiPickCriteria, source: AiPickResult['source'], rationale?: string): AiPickResult {
  const starters = chooseStarters(selected, criteria);
  const startingPlayers = selected.filter((p) => starters.has(p.id));
  const captainId = [...startingPlayers].sort((a, b) => b.price - a.price)[0]?.id;
  const costMillions = Number(selected.reduce((sum, p) => sum + p.price, 0).toFixed(1));
  const formation = (() => {
    const counts: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    for (const p of startingPlayers) counts[p.position] += 1;
    return `${counts.DEF}-${counts.MID}-${counts.FWD}`;
  })();
  return {
    picks: selected.map((p) => ({
      playerId: p.id,
      starter: starters.has(p.id),
      captain: p.id === captainId,
    })),
    formation,
    costMillions,
    source,
    ...(rationale ? { rationale } : {}),
  };
}

function heuristicPick(fullPool: PickPlayer[], criteria: AiPickCriteria): AiPickResult {
  const groups = candidatePool(fullPool, criteria.countries);
  const selected: PickPlayer[] = [];
  const usedByPos: Record<Position, PickPlayer[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  for (const position of POSITIONS) {
    const cheapest = groups[position].slice(0, COMPOSITION[position]);
    usedByPos[position] = cheapest;
    selected.push(...cheapest);
  }

  let cost = selected.reduce((sum, p) => sum + p.price, 0);
  const weights = SPEND_WEIGHT[criteria.strength];

  for (let guard = 0; guard < 500; guard += 1) {
    const remaining = criteria.budget - cost;
    let best: { position: Position; out: PickPlayer; in: PickPlayer; score: number } | null = null;
    for (const position of POSITIONS) {
      const current = usedByPos[position];
      const cheapestSelected = [...current].sort((a, b) => a.price - b.price)[0];
      if (!cheapestSelected) continue;
      const selectedIds = new Set(current.map((p) => p.id));
      const upgrade = groups[position]
        .filter((p) => !selectedIds.has(p.id) && p.price - cheapestSelected.price <= remaining)
        .sort((a, b) => b.price - a.price)[0];
      if (!upgrade) continue;
      const gain = upgrade.price - cheapestSelected.price;
      if (gain <= 0) continue;
      const score = gain * weights[position];
      if (!best || score > best.score) {
        best = { position, out: cheapestSelected, in: upgrade, score };
      }
    }
    if (!best) break;
    usedByPos[best.position] = usedByPos[best.position].map((p) => (p.id === best!.out.id ? best!.in : p));
    cost += best.in.price - best.out.price;
  }

  const finalSelected = POSITIONS.flatMap((position) => usedByPos[position]);
  return assemble(finalSelected, criteria, 'heuristic');
}

function buildTool(): { name: string; description: string; inputSchema: JsonSchema } {
  return {
    name: 'submit_squad',
    description: 'Submit a 15-player fantasy squad with starting XI and captain.',
    inputSchema: {
      type: 'object',
      properties: {
        playerIds: { type: 'array', items: { type: 'string' }, minItems: 15, maxItems: 15 },
        starterIds: { type: 'array', items: { type: 'string' }, minItems: 11, maxItems: 11 },
        captainId: { type: 'string' },
        rationale: { type: 'string' },
      },
      required: ['playerIds', 'starterIds', 'captainId'],
    } as JsonSchema,
  };
}

function shortlist(fullPool: PickPlayer[], countries: string[]): PickPlayer[] {
  const groups = candidatePool(fullPool, countries);
  const perPos: Record<Position, number> = { GK: 6, DEF: 14, MID: 14, FWD: 10 };
  return POSITIONS.flatMap((position) =>
    [...groups[position]].sort((a, b) => b.price - a.price).slice(0, perPos[position]),
  );
}

async function llmPick(fullPool: PickPlayer[], criteria: AiPickCriteria, llm: LlmClient): Promise<AiPickResult | null> {
  const candidates = shortlist(fullPool, criteria.countries);
  const byId = new Map(candidates.map((p) => [p.id, p]));
  const lines = candidates
    .map((p) => `${p.id} | ${p.name} | ${p.position} | ${p.teamCode} | ${p.price.toFixed(1)}m`)
    .join('\n');

  const system =
    'You are Tom, a sharp World Cup fantasy football manager. You build a balanced, ' +
    'budget-aware squad and explain nothing outside the tool call.';
  const prompt = [
    `Pick a squad of exactly 15 players: 2 GK, 5 DEF, 5 MID, 3 FWD.`,
    `Total price must be <= ${criteria.budget}m.`,
    `Choose 11 starters (1 GK, at least 3 DEF, at least 1 FWD) and 1 captain (must be a starter).`,
    `Manager brief: style="${criteria.strength}"${criteria.formation ? `, preferred formation ${criteria.formation}` : ''}.`,
    criteria.countries.length ? `Favour these countries: ${criteria.countries.join(', ')}.` : '',
    `Only use ids from this list (id | name | pos | team | price):`,
    lines,
  ]
    .filter(Boolean)
    .join('\n');

  const call = await llm.decide({ system, prompt, tools: [buildTool()] });
  const input = call.input as { playerIds?: unknown; starterIds?: unknown; captainId?: unknown; rationale?: unknown };
  const playerIds = Array.isArray(input.playerIds) ? input.playerIds.filter((v): v is string => typeof v === 'string') : [];
  const starterIds = new Set(
    Array.isArray(input.starterIds) ? input.starterIds.filter((v): v is string => typeof v === 'string') : [],
  );
  const captainId = typeof input.captainId === 'string' ? input.captainId : '';

  const selected = playerIds.map((id) => byId.get(id)).filter((p): p is PickPlayer => Boolean(p));
  if (selected.length !== 15) return null;

  const picks: AiSquadPick[] = selected.map((p) => ({
    playerId: p.id,
    starter: starterIds.has(p.id),
    captain: p.id === captainId,
  }));

  const validation = validateSquad(
    { maxBudgetMillions: criteria.budget, squadSize: 15, startingSize: 11 },
    selected.map((p) => ({
      position: p.position,
      priceMillions: p.price,
      starter: starterIds.has(p.id),
      captain: p.id === captainId,
    })),
  );
  if (!validation.valid) return null;

  const counts: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const p of selected) if (starterIds.has(p.id)) counts[p.position] += 1;
  const rationale = typeof input.rationale === 'string' ? input.rationale.slice(0, 280) : undefined;

  return {
    picks,
    formation: `${counts.DEF}-${counts.MID}-${counts.FWD}`,
    costMillions: validation.costMillions,
    source: 'llm',
    ...(rationale ? { rationale } : {}),
  };
}

export async function aiPick(
  fullPool: PickPlayer[],
  criteria: AiPickCriteria,
  llm?: LlmClient,
): Promise<AiPickResult> {
  if (llm) {
    try {
      const result = await llmPick(fullPool, criteria, llm);
      if (result) return result;
    } catch {
      // fall through to the deterministic heuristic
    }
  }
  return heuristicPick(fullPool, criteria);
}
