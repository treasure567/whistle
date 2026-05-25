import type { Request, Response } from 'express';
import type { LlmClient } from '@whistle/agent-core';
import { AppError, ErrorCode } from '@whistle/errors';
import { ok } from '../http/respond.js';
import { managerBriefBody } from '../schemas/fantasy.schema.js';
import { managerBrief } from '../services/manager-brief.js';

export type ManagerController = {
  brief: (req: Request, res: Response) => Promise<void>;
};

export function createManagerController(llm?: LlmClient): ManagerController {
  return {
    brief: async (req, res) => {
      const parsed = managerBriefBody.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(ErrorCode.VALIDATION, 'invalid briefing request');
      }
      ok(res, req, await managerBrief(parsed.data, llm));
    },
  };
}
