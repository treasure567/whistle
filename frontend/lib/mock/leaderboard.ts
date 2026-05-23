import type { Address } from "viem";

import type { LeaderboardRow } from "@/types";

function addr(seed: string): Address {
  const hex = Array.from(seed)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("")
    .padEnd(40, "a");
  return `0x${hex.slice(0, 40)}` as Address;
}

export const LEADERBOARD: ReadonlyArray<LeaderboardRow> = [
  {
    rank: 1,
    wallet: addr("wallet-aurora-1"),
    agent: "bookie",
    pnlUsdt: 3_140.5,
    decisions: 28,
    winRatePct: 64.3,
    delta24h: 420,
  },
  {
    rank: 2,
    wallet: addr("wallet-aurora-2"),
    agent: "manager",
    pnlUsdt: 2_420,
    decisions: 9,
    winRatePct: 77.8,
    delta24h: 180,
  },
  {
    rank: 3,
    wallet: addr("wallet-aurora-3"),
    agent: "bookie",
    pnlUsdt: 1_980,
    decisions: 35,
    winRatePct: 58.6,
    delta24h: -120,
  },
  {
    rank: 4,
    wallet: addr("wallet-aurora-4"),
    agent: "manager",
    pnlUsdt: 1_620,
    decisions: 8,
    winRatePct: 62.5,
    delta24h: 240,
  },
  {
    rank: 5,
    wallet: addr("wallet-aurora-5"),
    agent: "scout",
    pnlUsdt: 0,
    decisions: 19,
    winRatePct: 100,
    delta24h: 0,
  },
  {
    rank: 6,
    wallet: addr("wallet-aurora-6"),
    agent: "bookie",
    pnlUsdt: 1_240,
    decisions: 22,
    winRatePct: 55.2,
    delta24h: 80,
  },
  {
    rank: 7,
    wallet: addr("wallet-aurora-7"),
    agent: "manager",
    pnlUsdt: 1_120,
    decisions: 7,
    winRatePct: 71.4,
    delta24h: 60,
  },
  {
    rank: 8,
    wallet: addr("wallet-aurora-8"),
    agent: "bookie",
    pnlUsdt: 980,
    decisions: 18,
    winRatePct: 53.1,
    delta24h: -40,
  },
  {
    rank: 9,
    wallet: addr("wallet-aurora-9"),
    agent: "scout",
    pnlUsdt: 0,
    decisions: 14,
    winRatePct: 100,
    delta24h: 0,
  },
  {
    rank: 10,
    wallet: addr("wallet-aurora-10"),
    agent: "manager",
    pnlUsdt: 780,
    decisions: 6,
    winRatePct: 66.7,
    delta24h: 120,
  },
];
