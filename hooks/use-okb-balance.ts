"use client";

import { useAccount, useBalance } from "wagmi";

import { X_LAYER_CHAIN_ID } from "@/lib/chains";

// Live native OKB balance for the connected wallet on X Layer. This is the OKB
// the user sees in their own wallet (the chain's native gas token), not the
// MockERC20 funding token used to allocate to agents.
export function useOkbBalance() {
  const { address, isConnected } = useAccount();
  const { data, isLoading, refetch } = useBalance({
    address,
    chainId: X_LAYER_CHAIN_ID,
    query: { enabled: Boolean(address), refetchInterval: 30_000 },
  });

  const balance = data ? Number(data.formatted) : null;
  return { balance, isConnected, isLoading, refetch };
}
