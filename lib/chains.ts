import { defineChain } from "viem";

export const X_LAYER_CHAIN_ID = 1952 as const;

export const X_LAYER_RPC_URL =
  process.env.NEXT_PUBLIC_X_LAYER_RPC_URL ?? "https://testrpc.xlayer.tech/terigon";

export const X_LAYER_EXPLORER_URL = "https://www.okx.com/web3/explorer/xlayer-test";

export const xLayer = defineChain({
  id: X_LAYER_CHAIN_ID,
  name: "X Layer Testnet",
  nativeCurrency: {
    name: "OKB",
    symbol: "OKB",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [X_LAYER_RPC_URL],
    },
  },
  blockExplorers: {
    default: {
      name: "OKX Explorer",
      url: X_LAYER_EXPLORER_URL,
    },
  },
  testnet: true,
});

export const X_LAYER_USDT_ADDRESS =
  process.env.NEXT_PUBLIC_USDT_ADDRESS ?? "0x2CCfFdE9e4A425cb852f96CEC5fCd0Da2Be1b10A";
