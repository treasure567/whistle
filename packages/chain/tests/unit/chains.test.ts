import { describe, expect, it } from 'vitest';
import { defineXLayer } from '../../src/chains.js';
import { createPublicChainClient } from '../../src/clients.js';

describe('X Layer chain', () => {
  it('defines the chain from config', () => {
    const chain = defineXLayer({ chainId: 196, rpcUrl: 'https://rpc.xlayer.tech' });
    expect(chain.id).toBe(196);
    expect(chain.name).toBe('X Layer');
    expect(chain.rpcUrls.default.http[0]).toBe('https://rpc.xlayer.tech');
    expect(chain.nativeCurrency.symbol).toBe('OKB');
  });

  it('builds a public client bound to the chain', () => {
    const client = createPublicChainClient({ chainId: 195, rpcUrl: 'http://127.0.0.1:8545' });
    expect(client.chain?.id).toBe(195);
  });
});
