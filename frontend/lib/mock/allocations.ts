import type { Hex } from "viem";

import type { Allocation } from "@/types";

const HOUR = 3600_000;
const DAY = 24 * HOUR;
const NOW = 1_716_465_600_000;

function hash(seed: string): Hex {
  const hex = Array.from(seed)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("")
    .padEnd(64, "f");
  return `0x${hex.slice(0, 64)}` as Hex;
}

export const ALLOCATIONS: ReadonlyArray<Allocation> = [
  {
    id: "alloc-001",
    agent: "bookie",
    ceilingUsdt: 1_500,
    perMatchCapUsdt: 250,
    remainingUsdt: 982,
    sessionExpiresAt: NOW + 18 * HOUR,
    createdAt: NOW - 2 * DAY,
    txHash: hash("alloc-001"),
    status: "active",
  },
  {
    id: "alloc-002",
    agent: "manager",
    ceilingUsdt: 200,
    perMatchCapUsdt: 200,
    remainingUsdt: 0,
    sessionExpiresAt: NOW + 6 * DAY,
    createdAt: NOW - DAY,
    txHash: hash("alloc-002"),
    status: "active",
  },
  {
    id: "alloc-003",
    agent: "scout",
    ceilingUsdt: 10,
    perMatchCapUsdt: 2,
    remainingUsdt: 6.2,
    sessionExpiresAt: NOW + 36 * HOUR,
    createdAt: NOW - 4 * DAY,
    txHash: hash("alloc-003"),
    status: "active",
  },
  {
    id: "alloc-004",
    agent: "bookie",
    ceilingUsdt: 500,
    perMatchCapUsdt: 100,
    remainingUsdt: 0,
    sessionExpiresAt: NOW - 2 * HOUR,
    createdAt: NOW - 5 * DAY,
    txHash: hash("alloc-004"),
    status: "expired",
  },
];
