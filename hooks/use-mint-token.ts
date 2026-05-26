"use client";

import { useCallback, useState } from "react";
import { useAccount } from "wagmi";
import { writeContract, waitForTransactionReceipt, switchChain, getAccount } from "wagmi/actions";
import { parseUnits, type Hex } from "viem";

import { wagmiConfig } from "@/lib/wagmi";
import { ERC20_ABI } from "@/lib/abis";
import { STABLE_DECIMALS, STABLE_TOKEN_ADDRESS } from "@/lib/contracts";
import { X_LAYER_CHAIN_ID } from "@/lib/chains";

export type MintPhase = "idle" | "minting" | "confirming" | "success" | "error";

export type MintState = {
  phase: MintPhase;
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
  return message.split("\n")[0]?.slice(0, 160) ?? "Transaction failed.";
}

// Mints the MockERC20 test WHST (open faucet token) straight to the connected
// wallet. This is the spendable balance used to fund agents and place bets;
// native OKB is only needed for gas.
export function useMintToken() {
  const { address } = useAccount();
  const [state, setState] = useState<MintState>({ phase: "idle" });

  const reset = useCallback(() => setState({ phase: "idle" }), []);

  const mint = useCallback(
    async (amountOkb: number): Promise<Hex | null> => {
      if (!address) {
        setState({ phase: "error", error: "Connect a wallet first." });
        return null;
      }
      if (!Number.isFinite(amountOkb) || amountOkb <= 0) {
        setState({ phase: "error", error: "Enter an amount greater than zero." });
        return null;
      }
      const amount = parseUnits(String(amountOkb), STABLE_DECIMALS);

      try {
        if (getAccount(wagmiConfig).chainId !== X_LAYER_CHAIN_ID) {
          try {
            await switchChain(wagmiConfig, { chainId: X_LAYER_CHAIN_ID });
          } catch {
            setState({ phase: "error", error: "Switch your wallet to X Layer Testnet to mint." });
            return null;
          }
        }

        setState({ phase: "minting" });
        const txHash = await writeContract(wagmiConfig, {
          address: STABLE_TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: "mint",
          args: [address, amount],
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

  return { state, mint, reset };
}
