import { defineChain } from 'viem';

export type ChainConfig = {
  chainId: number;
  rpcUrl: string;
  name?: string;
};

export function defineXLayer(config: ChainConfig) {
  return defineChain({
    id: config.chainId,
    name: config.name ?? 'X Layer',
    nativeCurrency: { name: 'OKB', symbol: 'OKB', decimals: 18 },
    rpcUrls: { default: { http: [config.rpcUrl] } },
  });
}
