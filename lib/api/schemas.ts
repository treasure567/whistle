import { z } from "zod";

export const agentRecordSchema = z.object({
  id: z.string(),
  kind: z.enum(["SCOUT", "BOOKIE", "MANAGER"]),
  name: z.string(),
  strategyHash: z.string(),
  ownerAddress: z.string(),
  registryId: z.number().nullable(),
});
export type AgentRecord = z.infer<typeof agentRecordSchema>;
export const agentRecordsSchema = z.array(agentRecordSchema);

export const matchRecordSchema = z.object({
  id: z.string(),
  externalId: z.string(),
  homeCode: z.string(),
  awayCode: z.string(),
  kickoffAt: z.string(),
  status: z.string(),
});
export type MatchRecord = z.infer<typeof matchRecordSchema>;
export const matchRecordsSchema = z.array(matchRecordSchema);
