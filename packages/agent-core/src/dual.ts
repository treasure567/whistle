import type { LlmClient, LlmRequest, LlmToolCall } from './types.js';

export function createDualLlmClient(primary: LlmClient, fallback?: LlmClient): LlmClient {
  if (!fallback) {
    return primary;
  }
  return {
    provider: `${primary.provider}+${fallback.provider}`,
    async decide(request: LlmRequest): Promise<LlmToolCall> {
      try {
        return await primary.decide(request);
      } catch {
        return fallback.decide(request);
      }
    },
  };
}
