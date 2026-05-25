import type { Request, Response } from 'express';
import type { LlmClient } from '@whistle/agent-core';
import { AppError, ErrorCode } from '@whistle/errors';
import { ok } from '../http/respond.js';
import { matchChatBody, matchReadBody } from '../schemas/fantasy.schema.js';
import { matchChat, matchRead } from '../services/match-read.js';

export type MatchReadController = {
  read: (req: Request, res: Response) => Promise<void>;
  chat: (req: Request, res: Response) => Promise<void>;
};

export function createMatchReadController(llm?: LlmClient): MatchReadController {
  return {
    read: async (req, res) => {
      const parsed = matchReadBody.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(ErrorCode.VALIDATION, 'home and away are required');
      }
      ok(res, req, await matchRead(parsed.data.home, parsed.data.away, llm));
    },
    chat: async (req, res) => {
      const parsed = matchChatBody.safeParse(req.body);
      if (!parsed.success) {
        throw new AppError(ErrorCode.VALIDATION, 'invalid chat request');
      }
      ok(res, req, await matchChat(parsed.data.home, parsed.data.away, parsed.data.messages, llm));
    },
  };
}
