export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export type RuleConfig = {
  maxBudgetMillions: number;
  squadSize: number;
  startingSize: number;
};

export type SquadPlayer = {
  position: Position;
  priceMillions: number;
  starter: boolean;
  captain: boolean;
};

export type SquadValidation = {
  valid: boolean;
  errors: string[];
  costMillions: number;
};

const SQUAD_COMPOSITION: Record<Position, number> = { GK: 2, DEF: 5, MID: 5, FWD: 3 };

export function validateSquad(rules: RuleConfig, players: SquadPlayer[]): SquadValidation {
  const errors: string[] = [];

  if (players.length !== rules.squadSize) {
    errors.push(`squad must have ${rules.squadSize} players`);
  }

  const counts: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const player of players) counts[player.position] += 1;
  for (const position of Object.keys(SQUAD_COMPOSITION) as Position[]) {
    if (counts[position] !== SQUAD_COMPOSITION[position]) {
      errors.push(`squad needs exactly ${SQUAD_COMPOSITION[position]} ${position}`);
    }
  }

  const starters = players.filter((player) => player.starter);
  if (starters.length !== rules.startingSize) {
    errors.push(`starting lineup must have ${rules.startingSize} players`);
  }
  const startingCounts: Record<Position, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  for (const player of starters) startingCounts[player.position] += 1;
  if (startingCounts.GK !== 1) errors.push('exactly 1 starting goalkeeper');
  if (startingCounts.DEF < 3) errors.push('at least 3 starting defenders');
  if (startingCounts.FWD < 1) errors.push('at least 1 starting forward');

  if (players.filter((player) => player.captain).length !== 1) {
    errors.push('exactly 1 captain');
  }

  const costMillions = Number(
    players.reduce((sum, player) => sum + player.priceMillions, 0).toFixed(1),
  );
  if (costMillions > rules.maxBudgetMillions) {
    errors.push(`over budget: ${costMillions} of ${rules.maxBudgetMillions}`);
  }

  return { valid: errors.length === 0, errors, costMillions };
}
