"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";

import { wagmiConfig } from "@/lib/wagmi";
import { ChainGuard } from "@/components/providers/chain-guard";

if (typeof window !== "undefined") {
  const PURGE_KEY = "__whistle_wallet_purged_v1";
  if (!sessionStorage.getItem(PURGE_KEY)) {
    const STALE_PREFIXES = ["@appkit/", "rk-", "wagmi.", "wc@2:", "-walletlink:"];
    for (const key of Object.keys(localStorage)) {
      if (STALE_PREFIXES.some((p) => key.startsWith(p))) {
        try {
          localStorage.removeItem(key);
        } catch {
          /* ignore */
        }
      }
    }
    sessionStorage.setItem(PURGE_KEY, "1");
  }
}

export function Web3Provider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ChainGuard />
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
