import { defineChain } from "viem";

export const X_LAYER_CHAIN_ID = 196 as const;

export const xLayer = defineChain({
  id: X_LAYER_CHAIN_ID,
  name: "X Layer",
  nativeCurrency: {
    name: "OKB",
    symbol: "OKB",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_X_LAYER_RPC_URL ?? "https://rpc.xlayer.tech"],
    },
  },
  blockExplorers: {
    default: {
      name: "OKLink",
      url: "https://www.oklink.com/xlayer",
      apiUrl: "https://www.oklink.com/api/v5/explorer/xlayer",
    },
  },
  testnet: false,
});

export const X_LAYER_USDT_ADDRESS =
  "0x1E4a5963aBFD975d8c9021ce480b42188849D41d" as const;
