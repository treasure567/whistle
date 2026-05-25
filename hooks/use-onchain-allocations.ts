"use client";

import { useAccount, useReadContracts } from "wagmi";
import { formatUnits, type Address } from "viem";

import { POSITION_MANAGER_ABI } from "@/lib/abis";
import { AGENT_ONCHAIN_ID, STABLE_DECIMALS, getContract } from "@/lib/contracts";
import { X_LAYER_CHAIN_ID } from "@/lib/chains";
import type { AgentSlug } from "@/types";

const ZERO: Address = "0x0000000000000000000000000000000000000000";
const SLUGS: AgentSlug[] = ["scout", "bookie", "manager"];

export type OnchainAllocation = {
  slug: AgentSlug;
  agentId: bigint;
  fundedUsdt: number;
};

export function useOnchainAllocations() {
  const { address } = useAccount();
  const positionManager = getContract(X_LAYER_CHAIN_ID, "PositionManager");

  const { data, isLoading, refetch } = useReadContracts({
    allowFailure: true,
    contracts: SLUGS.map((slug) => ({
      address: positionManager,
      abi: POSITION_MANAGER_ABI,
      functionName: "allocations" as const,
      args: [address ?? ZERO, AGENT_ONCHAIN_ID[slug]] as const,
      chainId: X_LAYER_CHAIN_ID,
    })),
    query: { enabled: Boolean(address) },
  });

  const allocations: OnchainAllocation[] = SLUGS.map((slug, i) => {
    const raw = data?.[i]?.result as bigint | undefined;
    return {
      slug,
      agentId: AGENT_ONCHAIN_ID[slug],
      fundedUsdt: raw ? Number(formatUnits(raw, STABLE_DECIMALS)) : 0,
    };
  });

  return {
    allocations,
    isLoading,
    refetch,
    totalFunded: allocations.reduce((sum, a) => sum + a.fundedUsdt, 0),
    fundedCount: allocations.filter((a) => a.fundedUsdt > 0).length,
  };
}
