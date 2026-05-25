import { createPublicClient, createWalletClient, http, type Hex, type PublicClient, type WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { defineXLayer, type ChainConfig } from './chains.js';

export function createPublicChainClient(config: ChainConfig): PublicClient {
  return createPublicClient({
    chain: defineXLayer(config),
    transport: http(config.rpcUrl),
  });
}

export type SignerConfig = ChainConfig & { privateKey: Hex };

export function createSignerClient(config: SignerConfig): WalletClient {
  return createWalletClient({
    account: privateKeyToAccount(config.privateKey),
    chain: defineXLayer(config),
    transport: http(config.rpcUrl),
  });
}
