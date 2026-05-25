import type { Request, Response } from 'express';
import { AppError, ErrorCode } from '@whistle/errors';
import { ok } from '../http/respond.js';
import { agentKindParam } from '../schemas/agent.schema.js';
import type { AgentRepository } from '../repositories/agent.repo.js';

export type AgentController = {
  list: (req: Request, res: Response) => Promise<void>;
  getByKind: (req: Request, res: Response) => Promise<void>;
};

export function createAgentController(agents: AgentRepository): AgentController {
  return {
    list: async (req, res) => {
      ok(res, req, await agents.list());
    },
    getByKind: async (req, res) => {
      const parsed = agentKindParam.safeParse(req.params.kind);
      if (!parsed.success) {
        throw new AppError(ErrorCode.BAD_REQUEST, 'invalid agent kind');
      }
      const agent = await agents.getByKind(parsed.data);
      if (!agent) {
        throw new AppError(ErrorCode.NOT_FOUND, `agent not found: ${req.params.kind}`);
      }
      ok(res, req, agent);
    },
  };
}
