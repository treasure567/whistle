import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '@whistle/errors';
import { createAllocationController } from '@/controllers/allocation.controller.js';
import type { AllocationRepository } from '@/repositories/allocation.repo.js';
import type { AgentRepository } from '@/repositories/agent.repo.js';

const agentRow = {
  id: 'bookie-id',
  kind: 'BOOKIE' as const,
  name: 'The Bookie',
  strategyHash: '0x',
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

const agents: AgentRepository = { list: vi.fn(), getByKind: vi.fn(async () => agentRow) };

describe('allocation controller', () => {
  it('creates an allocation for a known agent', async () => {
    const created: unknown[] = [];
    const allocations: AllocationRepository = {
      create: vi.fn(async (input) => {
        created.push(input);
        return { id: 'a1', ...input, active: true } as never;
      }),
      listByUser: vi.fn(async () => []),
    };
    const res = mockRes();
    await createAllocationController(allocations, agents).create(
      mockReq({ body: { kind: 'BOOKIE', userAddress: '0xabc', amount: '1000000', asset: 'USDT' } }),
      res,
    );
    expect(allocations.create).toHaveBeenCalledWith({
      agentId: 'bookie-id',
      userAddress: '0xabc',
      amount: '1000000',
      asset: 'USDT',
    });
    expect(res.json).toHaveBeenCalled();
  });

  it('rejects an invalid allocation body', async () => {
    const allocations: AllocationRepository = { create: vi.fn(), listByUser: vi.fn() };
    await expect(
      createAllocationController(allocations, agents).create(
        mockReq({ body: { kind: 'BOOKIE', userAddress: '0xabc', amount: 'not-a-number' } }),
        mockRes(),
      ),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('lists allocations for a user', async () => {
    const allocations: AllocationRepository = {
      create: vi.fn(),
      listByUser: vi.fn(async () => []),
    };
    const res = mockRes();
    await createAllocationController(allocations, agents).list(
      mockReq({ query: { user: '0xabc' } }),
      res,
    );
    expect(allocations.listByUser).toHaveBeenCalledWith('0xabc');
    expect(res.json).toHaveBeenCalledWith({ ok: true, data: [] });
  });
});
