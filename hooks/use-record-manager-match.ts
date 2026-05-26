"use client";

import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { writeContract, waitForTransactionReceipt, switchChain, getAccount } from "wagmi/actions";
import type { Hex } from "viem";

import { wagmiConfig } from "@/lib/wagmi";
import { MANAGER_LOG_ABI } from "@/lib/abis";
import { getContract } from "@/lib/contracts";
import { X_LAYER_CHAIN_ID } from "@/lib/chains";

export type RecordPhase = "idle" | "saving" | "confirming" | "success" | "error";

export type RecordState = {
  phase: RecordPhase;
  txHash?: Hex;
  error?: string;
};

export type ManagerMatchInput = {
  nation: string;
  opponent: string;
  ourScore: number;
  theirScore: number;
  round: string;
  won: boolean;
};

function readableError(err: unknown): string {
  const message = err instanceof Error ? err.message : String(err);
  if (/user rejected|user denied|rejected the request/i.test(message)) {
    return "You rejected the transaction.";
  }
  if (/insufficient funds/i.test(message)) {
    return "Not enough OKB for gas. Top up native OKB and retry.";
  }
  return message.split("\n")[0]?.slice(0, 160) ?? "Transaction failed.";
}

// Records a played manager-mode match on the permissionless ManagerLog
// contract. Browser-signed; only native OKB for gas is needed.
export function useRecordManagerMatch() {
  const { address } = useAccount();
  const [state, setState] = useState<RecordState>({ phase: "idle" });

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  const record = useCallback(
    async (match: ManagerMatchInput): Promise<Hex | null> => {
      if (!address) {
        setState({ phase: "error", error: "Connect a wallet first." });
        return null;
      }
      try {
        if (getAccount(wagmiConfig).chainId !== X_LAYER_CHAIN_ID) {
          try {
            await switchChain(wagmiConfig, { chainId: X_LAYER_CHAIN_ID });
          } catch {
            setState({ phase: "error", error: "Switch your wallet to X Layer Testnet to save." });
            return null;
          }
        }

        setState({ phase: "saving" });
        const txHash = await writeContract(wagmiConfig, {
          address: getContract(X_LAYER_CHAIN_ID, "ManagerLog"),
          abi: MANAGER_LOG_ABI,
          functionName: "recordMatch",
          args: [
            match.nation,
            match.opponent,
            Math.max(0, Math.min(255, Math.round(match.ourScore))),
            Math.max(0, Math.min(255, Math.round(match.theirScore))),
            match.round,
            match.won,
          ],
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

  return { state, record, reset };
}
