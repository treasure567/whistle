import { runAgentDecision, type AgentDefinition, type LlmClient, type LlmToolCall } from '@whistle/agent-core';
import { AGENT_FEED_CHANNEL, type AgentActivityEvent } from '@whistle/types';
import type { AgentLookup } from '../repositories/agent.repo.js';
import type { DecisionRepository } from '../repositories/decision.repo.js';
import type { MatchRepository } from '../repositories/match.repo.js';
import type { IpfsPinner } from '../clients/ipfs.js';

export type AgentPublisher = {
  publish(channel: string, message: string): Promise<void>;
};

export type AgentRunnerDeps = {
  llm: LlmClient;
  definitions: AgentDefinition[];
  agents: AgentLookup;
  decisions: DecisionRepository;
  matches: MatchRepository;
  publisher: AgentPublisher;
  ipfs?: IpfsPinner;
};

export type TickResult = { decisions: number };

export type AgentRunner = {
  runTick(): Promise<TickResult>;
};

function matchNote(payload: unknown): string | null {
  if (payload && typeof payload === 'object' && 'note' in payload) {
    const note = (payload as Record<string, unknown>).note;
    return typeof note === 'string' ? note : null;
  }
  return null;
}

function summarize(toolCall: LlmToolCall): string {
  const { input } = toolCall;
  if (typeof input.headline === 'string') return input.headline;
  if (typeof input.market === 'string') return input.market;
  if (typeof input.changes === 'string') return input.changes;
  if (typeof input.reason === 'string') return input.reason;
  return toolCall.tool;
}

export function createAgentRunner(deps: AgentRunnerDeps): AgentRunner {
  const { llm, definitions, agents, decisions, matches, publisher, ipfs } = deps;

  return {
    async runTick() {
      const live = await matches.listLive();
      if (live.length === 0) return { decisions: 0 };

      let count = 0;
      for (const match of live) {
        const note = matchNote(match.payload);
        const context = {
          matchExternalId: match.externalId,
          summary: `${match.homeCode} versus ${match.awayCode}, status ${match.status}.${
            note ? ` Latest: ${note}` : ''
          }`,
        };

        for (const definition of definitions) {
          const agent = await agents.getByKind(definition.kind);
          if (!agent) continue;

          let toolCall: LlmToolCall;
          let prompt: string;
          let system: string;
          try {
            const decision = await runAgentDecision(llm, definition, context);
            toolCall = decision.toolCall;
            prompt = decision.prompt;
            system = decision.system;
          } catch {
            continue;
          }

          if (toolCall.tool === 'skip') continue;

          let action: Record<string, unknown> = { ...toolCall };
          if (ipfs && toolCall.tool === 'save_moment') {
            try {
              const pin = await ipfs.pinJson(`moment-${match.externalId}`, {
                match: match.externalId,
                ...toolCall.input,
              });
              action = { ...toolCall, ipfsUri: pin.uri };
            } catch {
              action = { ...toolCall };
            }
          }

          await decisions.record({
            agentId: agent.id,
            matchId: match.id,
            prompt: { system, prompt },
            response: toolCall,
            action,
          });
          count += 1;

          const event: AgentActivityEvent = {
            agent: definition.kind,
            matchExternalId: match.externalId,
            action: toolCall.tool,
            summary: summarize(toolCall),
            status: 'pending',
            txHash: null,
            occurredAt: new Date().toISOString(),
          };
          await publisher.publish(AGENT_FEED_CHANNEL, JSON.stringify(event));
        }
      }

      return { decisions: count };
    },
  };
}
