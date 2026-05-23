import { createConfig, http } from "wagmi";
import { coinbaseWallet, injected, walletConnect } from "wagmi/connectors";

import { xLayer } from "./chains";

export const WALLET_CONNECT_PROJECT_ID =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

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
    [xLayer.id]: http(
      process.env.NEXT_PUBLIC_X_LAYER_RPC_URL ?? "https://rpc.xlayer.tech",
    ),
  },
  ssr: true,
});

declare module "wagmi" {
  interface Register {
    config: typeof wagmiConfig;
  }
}
