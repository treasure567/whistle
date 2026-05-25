import type { AgentContext, AgentDecision, AgentDefinition, LlmClient } from './types.js';

export async function runAgentDecision(
  llm: LlmClient,
  definition: AgentDefinition,
  context: AgentContext,
): Promise<AgentDecision> {
  const prompt = definition.buildPrompt(context);
  const toolCall = await llm.decide({ system: definition.system, prompt, tools: definition.tools });
  return {
    kind: definition.kind,
    matchExternalId: context.matchExternalId,
    system: definition.system,
    prompt,
    toolCall,
  };
}
