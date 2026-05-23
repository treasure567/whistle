import type { Hex } from "viem";

import type { Mint } from "@/types";

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

const GRADIENTS = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-fuchsia-500",
  "bg-orange-500",
];

export const MINTS: ReadonlyArray<Mint> = [
  {
    id: "m-001",
    tokenId: 1247,
    matchId: "ARG-MEX",
    matchLabel: "ARG vs MEX",
    moment: "67' Goal — ARG go up 2–1",
    minute: 67,
    significance: 0.91,
    txHash: hash("m-001"),
    mintedAt: NOW - 2 * MINUTE,
    imageGradient: GRADIENTS[0],
  },
  {
    id: "m-002",
    tokenId: 1246,
    matchId: "FRA-GER",
    matchLabel: "FRA vs GER",
    moment: "19' Bicycle equaliser",
    minute: 19,
    significance: 0.84,
    txHash: hash("m-002"),
    mintedAt: NOW - 22 * MINUTE,
    imageGradient: GRADIENTS[1],
  },
  {
    id: "m-003",
    tokenId: 1245,
    matchId: "ARG-MEX",
    matchLabel: "ARG vs MEX",
    moment: "31' Straight red",
    minute: 31,
    significance: 0.88,
    txHash: hash("m-003"),
    mintedAt: NOW - 1.8 * HOUR,
    imageGradient: GRADIENTS[2],
  },
  {
    id: "m-004",
    tokenId: 1244,
    matchId: "ESP-NED",
    matchLabel: "ESP vs NED",
    moment: "90+4' Winner",
    minute: 94,
    significance: 0.97,
    txHash: hash("m-004"),
    mintedAt: NOW - HOUR,
    imageGradient: GRADIENTS[3],
  },
  {
    id: "m-005",
    tokenId: 1243,
    matchId: "ENG-USA",
    matchLabel: "ENG vs USA",
    moment: "88' Equaliser",
    minute: 88,
    significance: 0.82,
    txHash: hash("m-005"),
    mintedAt: NOW - 4 * HOUR,
    imageGradient: GRADIENTS[4],
  },
  {
    id: "m-006",
    tokenId: 1242,
    matchId: "BRA-POR",
    matchLabel: "BRA vs POR",
    moment: "56' Upset opener",
    minute: 56,
    significance: 0.79,
    txHash: hash("m-006"),
    mintedAt: NOW - 8 * HOUR,
    imageGradient: GRADIENTS[5],
  },
];
