"use client";

import { useEffect, useRef } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";

import { X_LAYER_CHAIN_ID } from "@/lib/chains";

// On connect, nudge the wallet onto X Layer Testnet so funding/predictions
// don't hit a chain-mismatch. Attempts once per connection; the user can still
// switch manually from the wallet menu if they decline.
export function ChainGuard() {
  const { isConnected } = useAccount();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const attempted = useRef(false);

  useEffect(() => {
    if (!isConnected) {
      attempted.current = false;
      return;
    }
    if (chainId === X_LAYER_CHAIN_ID || attempted.current) return;
    attempted.current = true;
    switchChain({ chainId: X_LAYER_CHAIN_ID });
  }, [isConnected, chainId, switchChain]);

  return null;
}
