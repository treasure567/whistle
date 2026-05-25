"use client";

import { useCallback, useState } from "react";

const KEY = "whistle_vc_v1";
const START = 1000;

function read(): number {
  if (typeof window === "undefined") return START;
  const raw = window.localStorage.getItem(KEY);
  const n = raw === null ? START : Number(raw);
  return Number.isFinite(n) ? n : START;
}

// Virtual "WC Coins" balance for betting on simulated matches. Persisted to
// localStorage; lazy-read so there's no setState-in-effect.
export function useVirtualWallet() {
  const [balance, setBalanceState] = useState<number>(read);

  const setBalance = useCallback((next: number) => {
    const rounded = Math.max(0, Math.round(next));
    setBalanceState(rounded);
    if (typeof window !== "undefined") window.localStorage.setItem(KEY, String(rounded));
  }, []);

  const reset = useCallback(() => setBalance(START), [setBalance]);

  return { balance, setBalance, reset, start: START };
}
