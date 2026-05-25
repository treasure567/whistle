"use client";

import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { readContract, writeContract, waitForTransactionReceipt } from "wagmi/actions";
import { parseUnits, type Hex } from "viem";

import { wagmiConfig } from "@/lib/wagmi";
import { ERC20_ABI, POSITION_MANAGER_ABI } from "@/lib/abis";
import {
  AGENT_ONCHAIN_ID,
  STABLE_DECIMALS,
  STABLE_TOKEN_ADDRESS,
  getContract,
} from "@/lib/contracts";
import { X_LAYER_CHAIN_ID } from "@/lib/chains";
import type { AgentSlug } from "@/types";

export type FundPhase =
  | "idle"
  | "checking"
  | "minting"
  | "approving"
  | "allocating"
  | "success"
  | "error";

export type FundState = {
  phase: FundPhase;
  txHash?: Hex;
  approveHash?: Hex;
  mintHash?: Hex;
  error?: string;
};

const PHASE_LABEL: Record<FundPhase, string> = {
  idle: "Ready",
  checking: "Checking balance",
  minting: "Minting test USDT",
  approving: "Approving spend",
  allocating: "Funding agent",
  success: "Funded",
  error: "Failed",
};

function readableError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/user rejected|user denied|rejected the request/i.test(message)) {
    return "You rejected the transaction.";
  }
  if (/insufficient funds/i.test(message)) {
    return "Not enough OKB for gas. Top up the wallet and retry.";
  }
  if (/InactiveAgent|AgentNotFound/i.test(message)) {
    return "This agent is not registered onchain yet.";
  }
  return message.split("\n")[0]?.slice(0, 160) ?? "Transaction failed.";
}

export function phaseLabel(phase: FundPhase): string {
  return PHASE_LABEL[phase];
}

export function useFundAgent() {
  const { address } = useAccount();
  const [state, setState] = useState<FundState>({ phase: "idle" });

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  const fund = useCallback(
    async (slug: AgentSlug, amountUsdt: number): Promise<Hex | null> => {
      if (!address) {
        setState({ phase: "error", error: "Connect a wallet first." });
        return null;
      }
      const agentId = AGENT_ONCHAIN_ID[slug];
      const positionManager = getContract(X_LAYER_CHAIN_ID, "PositionManager");
      const amount = parseUnits(String(amountUsdt), STABLE_DECIMALS);

      try {
        setState({ phase: "checking" });

        const balance = await readContract(wagmiConfig, {
          address: STABLE_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: "balanceOf",
          args: [address],
          chainId: X_LAYER_CHAIN_ID,
        });

        let mintHash: Hex | undefined;
        if (balance < amount) {
          setState({ phase: "minting" });
          mintHash = await writeContract(wagmiConfig, {
            address: STABLE_TOKEN_ADDRESS,
            abi: ERC20_ABI,
            functionName: "mint",
            args: [address, amount - balance],
            chainId: X_LAYER_CHAIN_ID,
          });
          await waitForTransactionReceipt(wagmiConfig, { hash: mintHash, chainId: X_LAYER_CHAIN_ID });
        }

        const allowance = await readContract(wagmiConfig, {
          address: STABLE_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: "allowance",
          args: [address, positionManager],
          chainId: X_LAYER_CHAIN_ID,
        });

        let approveHash: Hex | undefined;
        if (allowance < amount) {
          setState({ phase: "approving", mintHash });
          approveHash = await writeContract(wagmiConfig, {
            address: STABLE_TOKEN_ADDRESS,
            abi: ERC20_ABI,
            functionName: "approve",
            args: [positionManager, amount],
            chainId: X_LAYER_CHAIN_ID,
          });
          await waitForTransactionReceipt(wagmiConfig, { hash: approveHash, chainId: X_LAYER_CHAIN_ID });
        }

        setState({ phase: "allocating", mintHash, approveHash });
        const txHash = await writeContract(wagmiConfig, {
          address: positionManager,
          abi: POSITION_MANAGER_ABI,
          functionName: "allocate",
          args: [agentId, amount],
          chainId: X_LAYER_CHAIN_ID,
        });
        await waitForTransactionReceipt(wagmiConfig, { hash: txHash, chainId: X_LAYER_CHAIN_ID });

        setState({ phase: "success", txHash, approveHash, mintHash });
        return txHash;
      } catch (err) {
        setState({ phase: "error", error: readableError(err) });
        return null;
      }
    },
    [address],
  );

  return { state, fund, reset };
}
