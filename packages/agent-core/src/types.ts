import type { AgentKind } from '@whistle/types';

export type JsonSchema = Record<string, unknown>;

export type LlmTool = {
  name: string;
  description: string;
  inputSchema: JsonSchema;
};

export type LlmToolCall = {
  tool: string;
  input: Record<string, unknown>;
};

export type LlmRequest = {
  system: string;
  prompt: string;
  tools: LlmTool[];
  maxTokens?: number;
};

export type LlmClient = {
  readonly provider: string;
  decide(request: LlmRequest): Promise<LlmToolCall>;
};

export type FetchLike = typeof fetch;

export type AgentContext = {
  matchExternalId: string;
  summary: string;
};

export type AgentDefinition = {
  kind: AgentKind;
  system: string;
  tools: LlmTool[];
  buildPrompt: (context: AgentContext) => string;
};

export type AgentDecision = {
  kind: AgentKind;
  matchExternalId: string;
  system: string;
  prompt: string;
  toolCall: LlmToolCall;
};

export class LlmError extends Error {
  constructor(
    public readonly provider: string,
    message: string,
  ) {
    super(message);
    this.name = 'LlmError';
  }
}
