import type { Request, Response } from 'express';
import { AppError, ErrorCode } from '@whistle/errors';
import { ok } from '../http/respond.js';
import { allocationsQuery, createAllocationBody } from '../schemas/allocation.schema.js';
import type { AgentRepository } from '../repositories/agent.repo.js';
import type { AllocationRepository } from '../repositories/allocation.repo.js';

export type AllocationController = {
  create: (req: Request, res: Response) => Promise<void>;
  list: (req: Request, res: Response) => Promise<void>;
};

export function createAllocationController(
  allocations: AllocationRepository,
  agents: AgentRepository,
): AllocationController {
  return {
    create: async (req, res) => {
      const parsed = createAllocationBody.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(ErrorCode.VALIDATION, 'invalid allocation');
      }
      const agent = await agents.getByKind(parsed.data.kind);
      if (!agent) {
        throw new AppError(ErrorCode.NOT_FOUND, `agent not found: ${parsed.data.kind}`);
      }
      const created = await allocations.create({
        agentId: agent.id,
        userAddress: parsed.data.userAddress,
        amount: parsed.data.amount,
        asset: parsed.data.asset,
      });
      ok(res, req, created);
    },
    list: async (req, res) => {
      const parsed = allocationsQuery.safeParse(req.query);
      if (!parsed.success) {
        throw new AppError(ErrorCode.BAD_REQUEST, 'a user address is required');
      }
      ok(res, req, await allocations.listByUser(parsed.data.user));
    },
  };
}
