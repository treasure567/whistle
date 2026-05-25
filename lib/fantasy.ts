import type { PlayerRecord } from "@/lib/api/schemas";

export type Position = "GK" | "DEF" | "MID" | "FWD";

export const POSITIONS: ReadonlyArray<Position> = ["GK", "DEF", "MID", "FWD"];
export const SQUAD_COMPOSITION: Record<Position, number> = { GK: 2, DEF: 5, MID: 5, FWD: 3 };
export const STARTER_PLAN: Record<Position, number> = { GK: 1, DEF: 4, MID: 4, FWD: 2 };
export const SQUAD_SIZE = 15;
export const STARTING_SIZE = 11;
export const DEFAULT_BUDGET = 100;

export const POSITION_LABEL: Record<Position, string> = {
  GK: "Goalkeepers",
  DEF: "Defenders",
  MID: "Midfielders",
  FWD: "Forwards",
};

export type SquadSlot = {
  player: PlayerRecord;
  starter: boolean;
  captain: boolean;
};

export type SquadValidation = {
  valid: boolean;
  errors: string[];
  cost: number;
};

function emptyCounts(): Record<Position, number> {
  return { GK: 0, DEF: 0, MID: 0, FWD: 0 };
}

export function countByPosition(slots: ReadonlyArray<SquadSlot>): Record<Position, number> {
  const counts = emptyCounts();
  for (const slot of slots) counts[slot.player.position] += 1;
  return counts;
}

export function squadCost(slots: ReadonlyArray<SquadSlot>): number {
  return Number(slots.reduce((sum, slot) => sum + slot.player.priceMillions, 0).toFixed(1));
}

export function formationFromStarters(slots: ReadonlyArray<SquadSlot>): string {
  const counts = emptyCounts();
  for (const slot of slots) if (slot.starter) counts[slot.player.position] += 1;
  return `${counts.DEF}-${counts.MID}-${counts.FWD}`;
}

export function validateSquad(slots: ReadonlyArray<SquadSlot>, budget: number): SquadValidation {
  const errors: string[] = [];
  if (slots.length !== SQUAD_SIZE) errors.push(`Pick all ${SQUAD_SIZE} players`);

  const counts = countByPosition(slots);
  for (const position of POSITIONS) {
    if (counts[position] !== SQUAD_COMPOSITION[position]) {
      errors.push(`Need ${SQUAD_COMPOSITION[position]} ${POSITION_LABEL[position].toLowerCase()}`);
    }
  }

  const starters = slots.filter((slot) => slot.starter);
  if (starters.length !== STARTING_SIZE) errors.push(`Start exactly ${STARTING_SIZE} players`);
  const startingCounts = emptyCounts();
  for (const slot of starters) startingCounts[slot.player.position] += 1;
  if (startingCounts.GK !== 1) errors.push("Start one goalkeeper");
  if (startingCounts.DEF < 3) errors.push("Start at least three defenders");
  if (startingCounts.FWD < 1) errors.push("Start at least one forward");

  if (slots.filter((slot) => slot.captain).length !== 1) errors.push("Choose a captain");

  const cost = squadCost(slots);
  if (cost > budget) errors.push(`Over budget by ${(cost - budget).toFixed(1)}m`);

  return { valid: errors.length === 0, errors, cost };
}

export function autoPickStarters(slots: ReadonlyArray<SquadSlot>): SquadSlot[] {
  const chosen = new Set<string>();
  for (const position of POSITIONS) {
    const pool = slots
      .filter((slot) => slot.player.position === position)
      .sort((a, b) => b.player.priceMillions - a.player.priceMillions)
      .slice(0, STARTER_PLAN[position]);
    for (const slot of pool) chosen.add(slot.player.id);
  }
  const captainId = slots
    .filter((slot) => chosen.has(slot.player.id))
    .sort((a, b) => b.player.priceMillions - a.player.priceMillions)[0]?.player.id;
  return slots.map((slot) => ({
    ...slot,
    starter: chosen.has(slot.player.id),
    captain: slot.player.id === captainId,
  }));
}
