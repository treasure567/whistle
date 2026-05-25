import type { JsonSchema, LlmClient } from '@whistle/agent-core';

export type BriefPlayer = { name: string; position: string; price: number };

export type ManagerBriefInput = {
  countryName: string;
  opponentName: string;
  formation: string;
  ourStrength: number;
  theirStrength: number;
  xi: BriefPlayer[];
  bench: BriefPlayer[];
  played?: { ourScore: number; theirScore: number } | undefined;
};

export type ManagerBrief = {
  verdict: string;
  opponentRead: string;
  suggestions: string[];
  source: 'llm' | 'heuristic';
};

const SYSTEM =
  'You are Tom, a calm, experienced national-team manager. Before a knockout match you scout ' +
  'the opponent and give your player concise, practical advice on their lineup. You speak in plain ' +
  'football language, you are encouraging but honest, and you never waffle.';

function weakestStarter(xi: BriefPlayer[]): BriefPlayer | null {
  if (xi.length === 0) return null;
  return [...xi].filter((p) => p.position !== 'GK').sort((a, b) => a.price - b.price)[0] ?? null;
}

function bestBenchFor(position: string, bench: BriefPlayer[]): BriefPlayer | null {
  return [...bench].filter((p) => p.position === position).sort((a, b) => b.price - a.price)[0] ?? null;
}

function heuristicBrief(input: ManagerBriefInput): ManagerBrief {
  const diff = input.ourStrength - input.theirStrength;
  const verdict = diff > 0.08 ? 'Favourites' : diff < -0.08 ? 'Tough test' : 'Even game';
  const opponentRead =
    `${input.opponentName} come in ` +
    (input.theirStrength > 0.8
      ? 'as one of the stronger sides in the draw. We respect them, but we do not fear them.'
      : input.theirStrength > 0.6
        ? 'as a well-drilled, organised outfit. Patience will be key.'
        : 'as beatable. Take the game to them early.');

  const suggestions: string[] = [];
  if (diff < -0.08) {
    suggestions.push('They have the edge on paper, so stay compact. A 5-3-2 or 4-5-1 keeps us solid and lets us hit on the break.');
  } else if (diff > 0.08) {
    suggestions.push('We have the better squad. Get on the front foot with a 4-3-3 and pin them in their half.');
  } else {
    suggestions.push('It is finely balanced. A 4-3-3 keeps us flexible going both ways.');
  }

  const weak = weakestStarter(input.xi);
  if (weak) {
    const upgrade = bestBenchFor(weak.position, input.bench);
    if (upgrade && upgrade.price > weak.price + 0.2) {
      suggestions.push(`Think about ${upgrade.name} for ${weak.name} in ${weak.position}. There is more quality on the bench there.`);
    }
  }
  suggestions.push('Watch the first twenty minutes. Win your duels, keep it tight, and the chances will come.');

  return { verdict, opponentRead, suggestions: suggestions.slice(0, 3), source: 'heuristic' };
}

function heuristicAnalysis(input: ManagerBriefInput): ManagerBrief {
  const { ourScore, theirScore } = input.played ?? { ourScore: 0, theirScore: 0 };
  const won = ourScore > theirScore;
  const lost = ourScore < theirScore;
  const verdict = won ? 'Job done' : lost ? 'Painful one' : 'Battling draw';
  const opponentRead = won
    ? `A ${ourScore}-${theirScore} win over ${input.opponentName}. We controlled the big moments and took our chances.`
    : lost
      ? `A ${ourScore}-${theirScore} defeat to ${input.opponentName}. We came up short when it mattered most.`
      : `${ourScore}-${theirScore} with ${input.opponentName}. We dug in but could not find the winner.`;
  const suggestions = [
    won ? 'Keep the same spine, it is clicking.' : 'We need a sharper edge in the final third.',
    'Freshen the legs where you can before the next round.',
    'Tighten up at set pieces, that is where knockout ties turn.',
  ];
  return { verdict, opponentRead, suggestions: suggestions.slice(0, 3), source: 'heuristic' };
}

function briefTool(): { name: string; description: string; inputSchema: JsonSchema } {
  return {
    name: 'submit_brief',
    description: "Submit Tom's pre-match briefing for the player.",
    inputSchema: {
      type: 'object',
      properties: {
        verdict: { type: 'string', description: 'Two or three word read on the tie, e.g. "Winnable" or "Tough test".' },
        opponentRead: { type: 'string', description: 'One or two sentences scouting the opponent.' },
        suggestions: {
          type: 'array',
          minItems: 2,
          maxItems: 3,
          items: { type: 'string' },
          description: 'Two or three concrete lineup or tactical changes, naming our players/positions where useful.',
        },
      },
      required: ['verdict', 'opponentRead', 'suggestions'],
    } as JsonSchema,
  };
}

function squadLine(players: BriefPlayer[]): string {
  return players.length
    ? players.map((p) => `${p.name} (${p.position})`).join(', ')
    : 'none';
}

export async function managerBrief(input: ManagerBriefInput, llm?: LlmClient): Promise<ManagerBrief> {
  const fallback = (): ManagerBrief => (input.played ? heuristicAnalysis(input) : heuristicBrief(input));
  if (!llm) return fallback();
  try {
    const prompt = input.played
      ? `We are ${input.countryName}. We just played ${input.opponentName} in a knockout match and it ` +
        `finished ${input.played.ourScore}-${input.played.theirScore} (our score first). Our XI: ${squadLine(input.xi)}.\n` +
        `Give a short verdict on the performance, a one or two sentence analysis of how the match went, ` +
        `and two or three takeaways or changes to make before the next round. Submit via the submit_brief tool.`
      : `We are ${input.countryName}. Our next knockout opponent is ${input.opponentName}.\n` +
        `Our strength is ${input.ourStrength.toFixed(2)} of 1; theirs is ${input.theirStrength.toFixed(2)} of 1.\n` +
        `Our formation: ${input.formation}.\n` +
        `Our starting XI: ${squadLine(input.xi)}.\n` +
        `Our bench: ${squadLine(input.bench)}.\n\n` +
        `Give your player a short verdict on the tie, a one or two sentence scouting read on ` +
        `${input.opponentName}, and two or three concrete suggested changes to our lineup or shape ` +
        `(name our players where it helps). Submit via the submit_brief tool.`;
    const call = await llm.decide({ system: SYSTEM, prompt, tools: [briefTool()] });
    const data = call.input as { verdict?: unknown; opponentRead?: unknown; suggestions?: unknown };
    const verdict = typeof data.verdict === 'string' ? data.verdict.trim().slice(0, 40) : '';
    const opponentRead = typeof data.opponentRead === 'string' ? data.opponentRead.trim().slice(0, 320) : '';
    const suggestions = Array.isArray(data.suggestions)
      ? data.suggestions
          .filter((s): s is string => typeof s === 'string')
          .map((s) => s.trim().slice(0, 200))
          .filter(Boolean)
          .slice(0, 3)
      : [];
    if (!verdict || !opponentRead || suggestions.length === 0) return fallback();
    return { verdict, opponentRead, suggestions, source: 'llm' };
  } catch {
    return fallback();
  }
}
