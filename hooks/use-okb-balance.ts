"use client";

import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";

import { ERC20_ABI } from "@/lib/abis";
import { STABLE_DECIMALS, STABLE_TOKEN_ADDRESS } from "@/lib/contracts";
import { X_LAYER_CHAIN_ID } from "@/lib/chains";

// Live onchain OKB (MockERC20) balance for the connected wallet on X Layer.
export function useOkbBalance() {
  const { address, isConnected } = useAccount();
  const { data, isLoading, refetch } = useReadContract({
    address: STABLE_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: X_LAYER_CHAIN_ID,
    query: { enabled: Boolean(address), refetchInterval: 30_000 },
  });

  const balance = typeof data === "bigint" ? Number(formatUnits(data, STABLE_DECIMALS)) : null;
  return { balance, isConnected, isLoading, refetch };
}
