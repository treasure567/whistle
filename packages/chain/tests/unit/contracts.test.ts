import { describe, expect, it } from 'vitest';
import type { Address } from 'viem';
import { createPublicChainClient, createSignerClient } from '../../src/clients.js';
import { createSessionKey } from '../../src/session.js';
import { getReadContracts, getWriteContracts } from '../../src/contracts.js';
import { agentRegistryAbi } from '../../src/abis/index.js';

const addr = (last: string): Address => `0x${'0'.repeat(39)}${last}`;

const addresses = {
  agentRegistry: addr('1'),
  positionManager: addr('2'),
  momentNft: addr('3'),
  fantasyEntry: addr('4'),
  settlementOracle: addr('5'),
};

const config = { chainId: 195, rpcUrl: 'http://127.0.0.1:8545' };

describe('getContracts', () => {
  it('exposes read access with a public client', () => {
    const contracts = getReadContracts(addresses, createPublicChainClient(config));
    expect(typeof contracts.agentRegistry.read.getAgent).toBe('function');
    expect(typeof contracts.positionManager.read.getPosition).toBe('function');
  });

  it('exposes write access with a wallet client', () => {
    const wallet = createSignerClient({ ...config, privateKey: createSessionKey().privateKey });
    const contracts = getWriteContracts(addresses, {
      public: createPublicChainClient(config),
      wallet,
    });
    expect(typeof contracts.momentNft.write.mintMoment).toBe('function');
    expect(typeof contracts.settlementOracle.write.confirmResult).toBe('function');
  });

  it('ships the contract ABIs', () => {
    expect(Array.isArray(agentRegistryAbi)).toBe(true);
    expect(agentRegistryAbi.length).toBeGreaterThan(0);
  });
});
