import type { Hex } from "viem";

import type { Position } from "@/types";

const MINUTE = 60_000;
const HOUR = 3600_000;
const NOW = 1_716_465_600_000;

function hash(seed: string): Hex {
  const hex = Array.from(seed)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("")
    .padEnd(64, "f");
  return `0x${hex.slice(0, 64)}` as Hex;
}

export const POSITIONS: ReadonlyArray<Position> = [
  {
    id: "p-001",
    agent: "bookie",
    matchId: "ARG-MEX",
    matchLabel: "ARG vs MEX",
    market: "Next goal — ARG",
    side: "YES",
    stakeUsdt: 600,
    priceCents: 45,
    openedAt: NOW - 31 * MINUTE,
    txHash: hash("p-001"),
    status: "won",
    settledPnlUsdt: 320,
  },
  {
    id: "p-002",
    agent: "bookie",
    matchId: "FRA-GER",
    matchLabel: "FRA vs GER",
    market: "> 4 corners H1",
    side: "OVER",
    stakeUsdt: 420,
    priceCents: 54,
    openedAt: NOW - 4 * MINUTE,
    txHash: hash("p-002"),
    status: "open",
  },
  {
    id: "p-003",
    agent: "bookie",
    matchId: "FRA-GER",
    matchLabel: "FRA vs GER",
    market: "First card < 25'",
    side: "YES",
    stakeUsdt: 280,
    priceCents: 42,
    openedAt: NOW - 1.5 * HOUR,
    txHash: hash("p-003"),
    status: "open",
  },
  {
    id: "p-004",
    agent: "bookie",
    matchId: "ESP-NED",
    matchLabel: "ESP vs NED",
    market: "First goal < 30'",
    side: "YES",
    stakeUsdt: 500,
    priceCents: 52,
    openedAt: NOW - 3 * HOUR,
    txHash: hash("p-004"),
    status: "won",
    settledPnlUsdt: 144,
  },
  {
    id: "p-005",
    agent: "bookie",
    matchId: "ESP-NED",
    matchLabel: "ESP vs NED",
    market: "> 8 corners FT",
    side: "OVER",
    stakeUsdt: 300,
    priceCents: 40,
    openedAt: NOW - 3.5 * HOUR,
    txHash: hash("p-005"),
    status: "lost",
    settledPnlUsdt: -180,
  },
  {
    id: "p-006",
    agent: "bookie",
    matchId: "ARG-MEX",
    matchLabel: "ARG vs MEX",
    market: "H1 handicap ARG -0.5",
    side: "YES",
    stakeUsdt: 350,
    priceCents: 48,
    openedAt: NOW - 2.5 * HOUR,
    txHash: hash("p-006"),
    status: "won",
    settledPnlUsdt: 92,
  },
];
