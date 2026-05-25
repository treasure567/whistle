import type { AgentDefinition, LlmTool } from '@whistle/agent-core';

const skipTool: LlmTool = {
  name: 'skip',
  description: 'Take no action this cycle when nothing is worth acting on.',
  inputSchema: {
    type: 'object',
    properties: { reason: { type: 'string' } },
    required: ['reason'],
  },
};

export const scoutDefinition: AgentDefinition = {
  kind: 'SCOUT',
  system:
    'You are Emma, a careful observer who keeps only the most memorable World Cup moments. ' +
    'Save a moment only when it is genuinely significant: a goal, a decisive save, a red card, an upset. ' +
    'Skip routine events to avoid clutter. Refer to players by nation and jersey number only, never by name.',
  tools: [
    {
      name: 'save_moment',
      description: 'Keep a significant match moment as a commemorative highlight.',
      inputSchema: {
        type: 'object',
        properties: {
          minute: { type: 'integer' },
          significance: { type: 'number', description: 'cultural weight from 0 to 1' },
          headline: { type: 'string', description: 'one short line, no player names' },
        },
        required: ['minute', 'significance', 'headline'],
      },
    },
    skipTool,
  ],
  buildPrompt: (context) =>
    `Match ${context.matchExternalId}. Current state: ${context.summary}. Decide whether to keep a moment now.`,
};

export const bookieDefinition: AgentDefinition = {
  kind: 'BOOKIE',
  system:
    'You are Jack, a skeptical bookmaker who places small bets on what happens next in a match. ' +
    'Only bet when the odds look mispriced. Stay within the spending limit and never chase losses. ' +
    'Refer to players by nation and jersey number only, never by name.',
  tools: [
    {
      name: 'place_bet',
      description: 'Open a small position on a near-term match event.',
      inputSchema: {
        type: 'object',
        properties: {
          market: { type: 'string', description: 'e.g. first goal before minute 30' },
          side: { type: 'string', enum: ['yes', 'no'] },
          stakeUsdt: { type: 'number' },
          reason: { type: 'string' },
        },
        required: ['market', 'side', 'stakeUsdt', 'reason'],
      },
    },
    skipTool,
  ],
  buildPrompt: (context) =>
    `Match ${context.matchExternalId}. Current state: ${context.summary}. Find a mispriced bet or skip.`,
};

export const managerDefinition: AgentDefinition = {
  kind: 'MANAGER',
  system:
    'You are Tom, a pragmatic coach who picks which players to back each match. ' +
    'Choose a profile and justify changes briefly. ' +
    'Refer to players by nation and jersey number only, never by name.',
  tools: [
    {
      name: 'set_lineup',
      description: 'Set or adjust the backed players for this match.',
      inputSchema: {
        type: 'object',
        properties: {
          profile: { type: 'string', enum: ['Aggressive', 'Defensive', 'Contrarian'] },
          changes: { type: 'string', description: 'nation plus jersey number only' },
          reason: { type: 'string' },
        },
        required: ['profile', 'changes', 'reason'],
      },
    },
    skipTool,
  ],
  buildPrompt: (context) =>
    `Match ${context.matchExternalId}. Current state: ${context.summary}. Set the lineup or skip.`,
};

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  scoutDefinition,
  bookieDefinition,
  managerDefinition,
];
