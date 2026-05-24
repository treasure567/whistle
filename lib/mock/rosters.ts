import type { Hex } from "viem";

import type { Roster, RosterSlot } from "@/types";

const HOUR = 3600_000;
const NOW = 1_716_465_600_000;

function hash(seed: string): Hex {
  const hex = Array.from(seed)
    .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
    .join("")
    .padEnd(64, "f");
  return `0x${hex.slice(0, 64)}` as Hex;
}

function buildSquad(spec: Array<[RosterSlot["position"], string, number, number]>): RosterSlot[] {
  return spec.map(([position, nation, jersey, form]) => ({
    position,
    nation,
    jersey,
    form,
  }));
}

export const ROSTERS: ReadonlyArray<Roster> = [
  {
    id: "r-001",
    matchday: 3,
    profile: "Aggressive",
    txHash: hash("r-001"),
    setAt: NOW - 7 * 60_000,
    pointsProjected: 78,
    slots: buildSquad([
      ["GK", "FRA", 1, 0.71],
      ["DEF", "ARG", 4, 0.82],
      ["DEF", "BRA", 6, 0.79],
      ["DEF", "ESP", 5, 0.74],
      ["MID", "ENG", 8, 0.81],
      ["MID", "FRA", 6, 0.86],
      ["MID", "ARG", 10, 0.93],
      ["MID", "POR", 7, 0.88],
      ["FWD", "BRA", 9, 0.91],
      ["FWD", "ESP", 7, 0.85],
      ["FWD", "FRA", 9, 0.89],
    ]),
  },
  {
    id: "r-002",
    matchday: 2,
    profile: "Contrarian",
    txHash: hash("r-002"),
    setAt: NOW - 36 * HOUR,
    pointsProjected: 62,
    pointsActual: 71,
    slots: buildSquad([
      ["GK", "MEX", 13, 0.66],
      ["DEF", "JPN", 3, 0.72],
      ["DEF", "MEX", 4, 0.69],
      ["DEF", "JPN", 5, 0.71],
      ["DEF", "BEL", 2, 0.74],
      ["MID", "JPN", 8, 0.83],
      ["MID", "MEX", 11, 0.78],
      ["MID", "BEL", 7, 0.81],
      ["FWD", "JPN", 9, 0.84],
      ["FWD", "MEX", 22, 0.77],
      ["FWD", "BEL", 11, 0.80],
    ]),
  },
  {
    id: "r-003",
    matchday: 1,
    profile: "Defensive",
    txHash: hash("r-003"),
    setAt: NOW - 7 * 24 * HOUR,
    pointsProjected: 54,
    pointsActual: 58,
    slots: buildSquad([
      ["GK", "GER", 1, 0.82],
      ["DEF", "GER", 4, 0.79],
      ["DEF", "GER", 5, 0.76],
      ["DEF", "ITA", 3, 0.81],
      ["DEF", "ITA", 6, 0.78],
      ["MID", "GER", 8, 0.74],
      ["MID", "ITA", 7, 0.72],
      ["MID", "POR", 6, 0.70],
      ["MID", "POR", 8, 0.71],
      ["FWD", "POR", 9, 0.83],
      ["FWD", "GER", 11, 0.77],
    ]),
  },
];
