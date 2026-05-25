import { describe, expect, it, vi } from 'vitest';
import type { Request, Response } from 'express';
import { AppError } from '@whistle/errors';
import { requireServiceAuth } from '../../src/http/service-auth.js';

function mockReq(headers: Record<string, string> = {}): Request {
  return { header: (key: string) => headers[key.toLowerCase()] } as unknown as Request;
}

describe('requireServiceAuth', () => {
  it('passes through when no secret is configured', () => {
    const next = vi.fn();
    requireServiceAuth(undefined)(mockReq(), {} as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('allows a valid x-service-auth header', () => {
    const next = vi.fn();
    requireServiceAuth('secret')(mockReq({ 'x-service-auth': 'secret' }), {} as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('allows a valid bearer token', () => {
    const next = vi.fn();
    requireServiceAuth('secret')(mockReq({ authorization: 'Bearer secret' }), {} as Response, next);
    expect(next).toHaveBeenCalledWith();
  });

  it('rejects a missing or invalid key with 401', () => {
    const next = vi.fn();
    requireServiceAuth('secret')(mockReq({ 'x-service-auth': 'wrong' }), {} as Response, next);
    const err = next.mock.calls[0]?.[0];
    expect(err).toBeInstanceOf(AppError);
    expect((err as AppError).status).toBe(401);
  });
});
