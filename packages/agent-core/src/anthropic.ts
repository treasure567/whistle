import { LlmError, type FetchLike, type LlmClient, type LlmRequest, type LlmToolCall } from './types.js';

export type AnthropicOptions = {
  apiKey: string;
  model: string;
  baseUrl?: string;
  fetchImpl?: FetchLike;
};

type AnthropicContentBlock =
  | { type: 'tool_use'; name: string; input: Record<string, unknown> }
  | { type: 'text'; text: string };

type AnthropicResponse = { content?: AnthropicContentBlock[] };

export function createAnthropicClient(options: AnthropicOptions): LlmClient {
  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = options.baseUrl ?? 'https://api.anthropic.com';

  return {
    provider: 'anthropic',
    async decide(request: LlmRequest): Promise<LlmToolCall> {
      const response = await fetchImpl(`${baseUrl}/v1/messages`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-api-key': options.apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: options.model,
          max_tokens: request.maxTokens ?? 1024,
          system: request.system,
          tools: request.tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            input_schema: tool.inputSchema,
          })),
          tool_choice: { type: 'any' },
          messages: [{ role: 'user', content: request.prompt }],
        }),
      });

      if (!response.ok) {
        throw new LlmError('anthropic', `anthropic responded ${response.status}`);
      }

      const body = (await response.json()) as AnthropicResponse;
      const toolUse = body.content?.find((block) => block.type === 'tool_use');
      if (!toolUse || toolUse.type !== 'tool_use') {
        throw new LlmError('anthropic', 'no tool_use block in response');
      }
      return { tool: toolUse.name, input: toolUse.input };
    },
  };
}
