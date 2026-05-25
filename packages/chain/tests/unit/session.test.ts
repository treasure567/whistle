import { describe, expect, it } from 'vitest';
import { privateKeyToAccount } from 'viem/accounts';
import { createSessionKey } from '../../src/session.js';

describe('createSessionKey', () => {
  it('returns a 32-byte private key and its matching address', () => {
    const session = createSessionKey();
    expect(session.privateKey).toMatch(/^0x[0-9a-f]{64}$/);
    expect(session.address).toEqual(privateKeyToAccount(session.privateKey).address);
  });

  it('returns a fresh key each call', () => {
    expect(createSessionKey().privateKey).not.toEqual(createSessionKey().privateKey);
  });
});
