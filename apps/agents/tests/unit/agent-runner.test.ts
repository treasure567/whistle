import { describe, expect, it, vi } from 'vitest';
import { AGENT_FEED_CHANNEL } from '@whistle/types';
import type { Agent, AgentKind } from '@whistle/db';
import type { LlmClient, LlmToolCall } from '@whistle/agent-core';
import { createAgentRunner } from '@/services/agent-runner.js';
import { AGENT_DEFINITIONS } from '@/agents/definitions.js';
import type { AgentLookup } from '@/repositories/agent.repo.js';
import type { DecisionRepository } from '@/repositories/decision.repo.js';
import type { MatchRepository } from '@/repositories/match.repo.js';

function agentRow(kind: AgentKind): Agent {
  return {
    id: `${kind}-id`,
    kind,
    name: kind,
    strategyHash: '0x',
    ownerAddress: '0x0000000000000000000000000000000000000000',
    registryId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

const liveMatch = { id: 'm1', externalId: '215662', homeCode: 'ARG', awayCode: 'FRA', status: '1H' };

function deps(toolCall: LlmToolCall) {
  const recorded: { agentId: string; matchId: string | null }[] = [];
  const published: { channel: string; message: string }[] = [];

  const llm: LlmClient = { provider: 'fake', decide: vi.fn(async () => toolCall) };
  const agents: AgentLookup = {
    getByKind: async (kind) => agentRow(kind),
    list: async () => [],
  };
  const decisions: DecisionRepository = {
    record: async (input) => {
      recorded.push({ agentId: input.agentId, matchId: input.matchId });
      return agentRow('SCOUT') as unknown as never;
    },
    markSubmitted: async () => {},
  };
  const matches: MatchRepository = {
    upsertMany: async () => {},
    listUpcoming: async () => [],
    listLive: async () => [liveMatch],
  };
  const publisher = {
    publish: async (channel: string, message: string) => {
      published.push({ channel, message });
    },
  };
  return { llm, agents, decisions, matches, publisher, recorded, published };
}

describe('agent runner', () => {
  it('records one decision per agent for each live match and publishes activity', async () => {
    const d = deps({ tool: 'save_moment', input: { headline: 'goal at 67' } });
    const runner = createAgentRunner({
      llm: d.llm,
      definitions: AGENT_DEFINITIONS,
      agents: d.agents,
      decisions: d.decisions,
      matches: d.matches,
      publisher: d.publisher,
    });

    const result = await runner.runTick();

    expect(result.decisions).toBe(AGENT_DEFINITIONS.length);
    expect(d.recorded).toHaveLength(AGENT_DEFINITIONS.length);
    expect(d.recorded[0]?.matchId).toBe('m1');
    expect(d.published[0]?.channel).toBe(AGENT_FEED_CHANNEL);
  });

  it('records nothing when every agent skips', async () => {
    const d = deps({ tool: 'skip', input: { reason: 'nothing notable' } });
    const runner = createAgentRunner({
      llm: d.llm,
      definitions: AGENT_DEFINITIONS,
      agents: d.agents,
      decisions: d.decisions,
      matches: d.matches,
      publisher: d.publisher,
    });

    const result = await runner.runTick();

    expect(result.decisions).toBe(0);
    expect(d.published).toHaveLength(0);
  });

  it('does nothing when there are no live matches', async () => {
    const d = deps({ tool: 'save_moment', input: {} });
    d.matches.listLive = async () => [];
    const runner = createAgentRunner({
      llm: d.llm,
      definitions: AGENT_DEFINITIONS,
      agents: d.agents,
      decisions: d.decisions,
      matches: d.matches,
      publisher: d.publisher,
    });

    expect((await runner.runTick()).decisions).toBe(0);
  });
});
