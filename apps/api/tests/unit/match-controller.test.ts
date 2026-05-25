import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '@whistle/errors';
import { createMatchController } from '@/controllers/match.controller.js';
import type { MatchRepository } from '@/repositories/match.repo.js';

const matchRow = {
  id: 'm1',
  externalId: '215662',
  homeCode: 'ARG',
  awayCode: 'FRA',
  kickoffAt: new Date('2026-06-11T16:00:00Z'),
  status: 'NS',
  payload: {},
  createdAt: new Date(),
  updatedAt: new Date(),
};

function mockRes() {
  return { json: vi.fn() } as unknown as Response;
}

function mockReq(partial: Record<string, unknown>) {
  return partial as unknown as Request;
}

describe('match controller', () => {
  it('lists matches with the default limit', async () => {
    const repo: MatchRepository = {
      list: vi.fn(async () => [matchRow]),
      getByExternalId: vi.fn(),
    };
    const res = mockRes();
    await createMatchController(repo).list(mockReq({ query: {} }), res);
    expect(repo.list).toHaveBeenCalledWith(50);
    expect(res.json).toHaveBeenCalledWith({ ok: true, data: [matchRow] });
  });

  it('returns a single match by external id', async () => {
    const repo: MatchRepository = {
      list: vi.fn(),
      getByExternalId: vi.fn(async () => matchRow),
    };
    const res = mockRes();
    await createMatchController(repo).getByExternalId(
      mockReq({ params: { externalId: '215662' } }),
      res,
    );
    expect(repo.getByExternalId).toHaveBeenCalledWith('215662');
    expect(res.json).toHaveBeenCalledWith({ ok: true, data: matchRow });
  });

  it('throws NOT_FOUND for a missing match', async () => {
    const repo: MatchRepository = {
      list: vi.fn(),
      getByExternalId: vi.fn(async () => null),
    };
    await expect(
      createMatchController(repo).getByExternalId(mockReq({ params: { externalId: 'x' } }), mockRes()),
    ).rejects.toBeInstanceOf(AppError);
  });
});
