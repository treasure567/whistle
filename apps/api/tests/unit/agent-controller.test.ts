import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '@whistle/errors';
import { createAgentController } from '@/controllers/agent.controller.js';
import type { AgentRepository } from '@/repositories/agent.repo.js';

const agentRow = {
  id: 'a1',
  kind: 'SCOUT' as const,
  name: 'The Scout',
  strategyHash: '0xabc',
  ownerAddress: '0x0000000000000000000000000000000000000000',
  registryId: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

function mockRes() {
  return { json: vi.fn() } as unknown as Response;
}

function mockReq(partial: Record<string, unknown>) {
  return partial as unknown as Request;
}

describe('agent controller', () => {
  it('lists agents with the request id', async () => {
    const repo: AgentRepository = {
      list: vi.fn(async () => [agentRow]),
      getByKind: vi.fn(),
    };
    const res = mockRes();
    await createAgentController(repo).list(mockReq({ requestId: 'r1' }), res);
    expect(res.json).toHaveBeenCalledWith({ ok: true, data: [agentRow], requestId: 'r1' });
  });

  it('resolves a known kind case-insensitively', async () => {
    const repo: AgentRepository = {
      list: vi.fn(),
      getByKind: vi.fn(async () => agentRow),
    };
    const res = mockRes();
    await createAgentController(repo).getByKind(mockReq({ params: { kind: 'scout' } }), res);
    expect(repo.getByKind).toHaveBeenCalledWith('SCOUT');
    expect(res.json).toHaveBeenCalledWith({ ok: true, data: agentRow });
  });

  it('throws NOT_FOUND for a missing agent', async () => {
    const repo: AgentRepository = {
      list: vi.fn(),
      getByKind: vi.fn(async () => null),
    };
    await expect(
      createAgentController(repo).getByKind(mockReq({ params: { kind: 'manager' } }), mockRes()),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('rejects an invalid kind', async () => {
    const repo: AgentRepository = { list: vi.fn(), getByKind: vi.fn() };
    await expect(
      createAgentController(repo).getByKind(mockReq({ params: { kind: 'zzz' } }), mockRes()),
    ).rejects.toBeInstanceOf(AppError);
  });
});
