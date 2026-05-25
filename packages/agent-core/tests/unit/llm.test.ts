import { describe, expect, it, vi } from 'vitest';
import { createAnthropicClient } from '../../src/anthropic.js';
import { createOpenAiClient } from '../../src/openai.js';
import { createDualLlmClient } from '../../src/dual.js';
import { runAgentDecision } from '../../src/agent.js';
import type { AgentDefinition, LlmClient, LlmRequest } from '../../src/types.js';

function jsonResponse(body: unknown, status = 200) {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as unknown as Response;
}

const request: LlmRequest = {
  system: 'you are a test',
  prompt: 'decide',
  tools: [{ name: 'mint_moment', description: 'mint', inputSchema: { type: 'object' } }],
};

describe('anthropic client', () => {
  it('parses a tool_use block', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({ content: [{ type: 'tool_use', name: 'mint_moment', input: { minute: 67 } }] }),
    );
    const client = createAnthropicClient({ apiKey: 'k', model: 'm', fetchImpl });
    expect(await client.decide(request)).toEqual({ tool: 'mint_moment', input: { minute: 67 } });
  });

  it('throws on a non-ok response', async () => {
    const client = createAnthropicClient({
      apiKey: 'k',
      model: 'm',
      fetchImpl: vi.fn(async () => jsonResponse({}, 500)),
    });
    await expect(client.decide(request)).rejects.toThrow();
  });
});

describe('openai client', () => {
  it('parses a function tool call with JSON arguments', async () => {
    const fetchImpl = vi.fn(async () =>
      jsonResponse({
        choices: [
          {
            message: {
              tool_calls: [{ function: { name: 'open_position', arguments: '{"stake":100}' } }],
            },
          },
        ],
      }),
    );
    const client = createOpenAiClient({ apiKey: 'k', model: 'm', fetchImpl });
    expect(await client.decide(request)).toEqual({ tool: 'open_position', input: { stake: 100 } });
  });
});

describe('dual client', () => {
  it('falls back to the secondary on primary failure', async () => {
    const primary: LlmClient = {
      provider: 'primary',
      decide: vi.fn(async () => {
        throw new Error('down');
      }),
    };
    const fallback: LlmClient = {
      provider: 'fallback',
      decide: vi.fn(async () => ({ tool: 'set_roster', input: {} })),
    };
    const dual = createDualLlmClient(primary, fallback);
    expect(await dual.decide(request)).toEqual({ tool: 'set_roster', input: {} });
    expect(fallback.decide).toHaveBeenCalledOnce();
  });
});

describe('runAgentDecision', () => {
  it('builds the prompt and returns a typed decision', async () => {
    const definition: AgentDefinition = {
      kind: 'SCOUT',
      system: 'scout',
      tools: request.tools,
      buildPrompt: (context) => `match ${context.matchExternalId}: ${context.summary}`,
    };
    const llm: LlmClient = {
      provider: 'fake',
      decide: vi.fn(async () => ({ tool: 'mint_moment', input: { minute: 67 } })),
    };
    const decision = await runAgentDecision(llm, definition, {
      matchExternalId: '215662',
      summary: 'goal at 67',
    });
    expect(decision.kind).toBe('SCOUT');
    expect(decision.prompt).toContain('215662');
    expect(decision.toolCall.tool).toBe('mint_moment');
  });
});
