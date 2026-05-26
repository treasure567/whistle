"use client";

import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { readContract, writeContract, waitForTransactionReceipt, switchChain, getAccount } from "wagmi/actions";
import type { Hex } from "viem";

import { wagmiConfig } from "@/lib/wagmi";
import { POSITION_MANAGER_ABI } from "@/lib/abis";
import { AGENT_ONCHAIN_ID, getContract } from "@/lib/contracts";
import { X_LAYER_CHAIN_ID } from "@/lib/chains";
import type { AgentSlug } from "@/types";

export type WithdrawPhase = "idle" | "withdrawing" | "confirming" | "success" | "error";

export type WithdrawState = {
  phase: WithdrawPhase;
  txHash?: Hex;
  error?: string;
};

function readableError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/user rejected|user denied|rejected the request/i.test(message)) {
    return "You rejected the transaction.";
  }
  if (/insufficient funds/i.test(message)) {
    return "Not enough OKB for gas. Top up native OKB and retry.";
  }
  if (/InsufficientAllocation/i.test(message)) {
    return "Nothing left to withdraw for this agent.";
  }
  return message.split("\n")[0]?.slice(0, 160) ?? "Transaction failed.";
}

// Pulls the user's full WHST allocation for an agent back to their wallet via
// PositionManager.withdraw. Trustless: they only ever withdraw their own funds.
export function useWithdrawAllocation() {
  const { address } = useAccount();
  const [state, setState] = useState<WithdrawState>({ phase: "idle" });

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  const withdraw = useCallback(
    async (slug: AgentSlug): Promise<Hex | null> => {
      if (!address) {
        setState({ phase: "error", error: "Connect a wallet first." });
        return null;
      }
      const positionManager = getContract(X_LAYER_CHAIN_ID, "PositionManager");
      const agentId = AGENT_ONCHAIN_ID[slug];

      try {
        if (getAccount(wagmiConfig).chainId !== X_LAYER_CHAIN_ID) {
          try {
            await switchChain(wagmiConfig, { chainId: X_LAYER_CHAIN_ID });
          } catch {
            setState({ phase: "error", error: "Switch your wallet to X Layer Testnet to withdraw." });
            return null;
          }
        }

        const amount = await readContract(wagmiConfig, {
          address: positionManager,
          abi: POSITION_MANAGER_ABI,
          functionName: "allocations",
          args: [address, agentId],
          chainId: X_LAYER_CHAIN_ID,
        });
        if (!amount || amount === 0n) {
          setState({ phase: "error", error: "Nothing to withdraw for this agent." });
          return null;
        }

        setState({ phase: "withdrawing" });
        const txHash = await writeContract(wagmiConfig, {
          address: positionManager,
          abi: POSITION_MANAGER_ABI,
          functionName: "withdraw",
          args: [agentId, amount],
          chainId: X_LAYER_CHAIN_ID,
        });

        setState({ phase: "confirming", txHash });
        await waitForTransactionReceipt(wagmiConfig, { hash: txHash, chainId: X_LAYER_CHAIN_ID });

        setState({ phase: "success", txHash });
        return txHash;
      } catch (err) {
        setState({ phase: "error", error: readableError(err) });
        return null;
      }
    },
    [address],
  );

  return { state, withdraw, reset };
}
