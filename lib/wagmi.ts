import { createConfig, http } from "wagmi";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";
import type { EIP1193Provider } from "viem";

import { xLayer, X_LAYER_RPC_URL } from "./chains";

export const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

function okxProvider(): EIP1193Provider | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as Window & { okxwallet?: EIP1193Provider }).okxwallet;
}

const APP_METADATA = {
  name: "whistle — AI helpers for football",
  description:
    "Three AI helpers for World Cup matches. Emma, Jack, and Tom work while you watch.",
  url:
    typeof window !== "undefined"
      ? window.location.origin
      : "https://whistle-agents.xyz",
  icons: [
    typeof window !== "undefined"
      ? `${window.location.origin}/icon.svg`
      : "https://whistle-agents.xyz/icon.svg",
  ],
};

export const wagmiConfig = createConfig({
  chains: [xLayer],
  connectors: [
    injected({
      target: () => ({
        id: "okxWallet",
        name: "OKX Wallet",
        provider: () => okxProvider(),
      }),
      shimDisconnect: true,
    }),
    injected({ shimDisconnect: true }),
    ...(WALLET_CONNECT_PROJECT_ID
      ? [
          walletConnect({
            projectId: WALLET_CONNECT_PROJECT_ID,
            metadata: APP_METADATA,
            showQrModal: true,
          }),
        ]
      : []),
    coinbaseWallet({
      appName: APP_METADATA.name,
      appLogoUrl: APP_METADATA.icons[0],
    }),
  ],
  transports: {
    [xLayer.id]: http(X_LAYER_RPC_URL),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
