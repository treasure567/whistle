"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { useAccount, useReadContract } from "wagmi";
import { formatUnits } from "viem";
import { ArrowRight01Icon, Tick02Icon, SparklesIcon, Loading03Icon } from "hugeicons-react";

import { Button } from "@/components/ui/button";
import { ConnectButton } from "@/components/ui/connect-button";
import { TxLink } from "@/components/ui/tx-link";
import { ERC20_ABI } from "@/lib/abis";
import { STABLE_DECIMALS, STABLE_TOKEN_ADDRESS } from "@/lib/contracts";
import { X_LAYER_CHAIN_ID } from "@/lib/chains";
import { truncateAddress } from "@/lib/format";
import { useMintToken, type MintState } from "@/hooks/use-mint-token";
import { cn } from "@/lib/utils";

const PRESETS = [50, 100, 250, 1000];

export function MintCard() {
  const { isConnected, address } = useAccount();
  const { state, mint, reset } = useMintToken();
  const [amount, setAmount] = useState(250);

  const balance = useReadContract({
    address: STABLE_TOKEN_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    chainId: X_LAYER_CHAIN_ID,
    query: { enabled: Boolean(address) },
  });

  const busy = state.phase === "minting" || state.phase === "confirming";
  const done = state.phase === "success";

  async function handleMint() {
    const hash = await mint(amount);
    if (hash) void balance.refetch();
  }

  const balanceLabel =
    balance.data !== undefined
      ? Number(formatUnits(balance.data, STABLE_DECIMALS)).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })
      : isConnected
        ? "…"
        : "—";

  return (
    <div className="mx-auto max-w-xl px-6 md:px-10">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="overflow-hidden rounded-3xl border border-border bg-card"
      >
        <div className="flex items-center justify-between gap-4 border-b border-border bg-foreground/[0.02] px-6 py-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Your test WHST
            </p>
            <p className="mt-1 font-mono text-2xl tabular-nums tracking-tight text-foreground">
              {balanceLabel} <span className="text-sm text-muted-foreground">WHST</span>
            </p>
          </div>
          <span className="inline-flex size-11 items-center justify-center rounded-2xl border border-primary/30 bg-primary/[0.08] text-primary">
            <SparklesIcon size={18} />
          </span>
        </div>

        {done ? (
          <MintSuccess state={state} onMintMore={reset} />
        ) : (
          <div className="px-6 py-6">
            <label
              htmlFor="mint-amount"
              className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground"
            >
              Amount to mint
            </label>
            <div className="mt-3 flex items-baseline gap-2">
              <input
                id="mint-amount"
                type="number"
                min={1}
                value={amount}
                onChange={(e) => setAmount(Math.max(1, Number(e.target.value)))}
                disabled={busy}
                className="w-40 bg-transparent font-mono text-4xl tabular-nums tracking-tight text-foreground outline-none disabled:opacity-50"
              />
              <span className="font-mono text-sm text-muted-foreground">WHST</span>
            </div>

            <div className="mt-4 flex flex-wrap gap-1.5">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  disabled={busy}
                  className={cn(
                    "rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors disabled:opacity-50",
                    amount === p
                      ? "border-primary/50 bg-primary/[0.08] text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  {p.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="mt-6">
              {!isConnected ? (
                <ConnectButton />
              ) : (
                <Button variant="violet" className="w-full" onClick={handleMint} disabled={busy}>
                  {busy ? (
                    <>
                      <Loading03Icon size={15} className="animate-spin" />
                      {state.phase === "confirming" ? "Confirming onchain" : "Confirm in wallet"}
                    </>
                  ) : (
                    <>
                      Mint {amount.toLocaleString()} test WHST
                      <ArrowRight01Icon size={15} />
                    </>
                  )}
                </Button>
              )}
            </div>

            {state.phase === "error" && state.error ? (
              <p className="mt-4 rounded-xl border border-destructive/30 bg-destructive/[0.06] p-3 text-[12px] text-destructive">
                {state.error}
              </p>
            ) : null}

            <p className="mt-4 text-[12px] leading-relaxed text-muted-foreground">
              Test WHST is free and only works on X Layer testnet. You need a small
              amount of native OKB for gas to mint.
            </p>
          </div>
        )}
      </motion.div>

      {isConnected ? (
        <p className="mt-4 text-center font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
          Minting to {truncateAddress(address ?? "")}
        </p>
      ) : null}
    </div>
  );
}

function MintSuccess({ state, onMintMore }: { state: MintState; onMintMore: () => void }) {
  return (
    <div className="px-6 py-6">
      <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
        <span className="inline-flex size-9 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
          <Tick02Icon size={15} />
        </span>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-emerald-600 dark:text-emerald-300">
            Minted onchain
          </p>
          <p className="mt-0.5 text-sm text-foreground">Your test WHST is in your wallet.</p>
        </div>
      </div>

      {state.txHash ? (
        <div className="mt-4 flex items-center justify-between rounded-xl border border-border bg-foreground/[0.02] px-4 py-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Mint tx
          </span>
          <TxLink hash={state.txHash} chars={6} />
        </div>
      ) : null}

      <div className="mt-5 flex flex-col gap-2 sm:flex-row">
        <Link href="/allocate" className="flex-1">
          <Button variant="violet" className="w-full">
            Fund an agent
            <ArrowRight01Icon size={14} />
          </Button>
        </Link>
        <Button variant="outline" className="flex-1" onClick={onMintMore}>
          Mint more
        </Button>
      </div>
    </div>
  );
}
