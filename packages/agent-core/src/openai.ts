import { LlmError, type FetchLike, type LlmClient, type LlmRequest, type LlmToolCall } from './types.js';

export type OpenAiOptions = {
  apiKey: string;
  model: string;
  baseUrl?: string;
  fetchImpl?: FetchLike;
};

type OpenAiResponse = {
  choices?: Array<{
    message?: {
      tool_calls?: Array<{ function?: { name?: string; arguments?: string } }>;
    };
  }>;
};

export function createOpenAiClient(options: OpenAiOptions): LlmClient {
  const fetchImpl = options.fetchImpl ?? fetch;
  const baseUrl = options.baseUrl ?? 'https://api.openai.com';

  return {
    provider: 'openai',
    async decide(request: LlmRequest): Promise<LlmToolCall> {
      const response = await fetchImpl(`${baseUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          authorization: `Bearer ${options.apiKey}`,
        },
        body: JSON.stringify({
          model: options.model,
          messages: [
            { role: 'system', content: request.system },
            { role: 'user', content: request.prompt },
          ],
          tools: request.tools.map((tool) => ({
            type: 'function',
            function: {
              name: tool.name,
              description: tool.description,
              parameters: tool.inputSchema,
            },
          })),
          tool_choice: 'required',
        }),
      });

      if (!response.ok) {
        throw new LlmError('openai', `openai responded ${response.status}`);
      }

      const body = (await response.json()) as OpenAiResponse;
      const call = body.choices?.[0]?.message?.tool_calls?.[0]?.function;
      if (!call?.name) {
        throw new LlmError('openai', 'no tool call in response');
      }

      let input: Record<string, unknown> = {};
      if (call.arguments) {
        try {
          input = JSON.parse(call.arguments) as Record<string, unknown>;
        } catch {
          throw new LlmError('openai', 'tool arguments were not valid JSON');
        }
      }
      return { tool: call.name, input };
    },
  };
}
