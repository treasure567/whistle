export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export type PlayerPerformance = {
  minutes: number;
  goals: number;
  assists: number;
  cleanSheet: boolean;
  goalsConceded: number;
  yellowCards: number;
  redCards: number;
  ownGoals: number;
  penaltiesSaved: number;
  penaltiesMissed: number;
  saves: number;
};

export const EMPTY_PERFORMANCE: PlayerPerformance = {
  minutes: 0,
  goals: 0,
  assists: 0,
  cleanSheet: false,
  goalsConceded: 0,
  yellowCards: 0,
  redCards: 0,
  ownGoals: 0,
  penaltiesSaved: 0,
  penaltiesMissed: 0,
  saves: 0,
};

const GOAL_POINTS: Record<Position, number> = { GK: 6, DEF: 6, MID: 5, FWD: 4 };
const CLEAN_SHEET_POINTS: Record<Position, number> = { GK: 4, DEF: 4, MID: 1, FWD: 0 };

export function scorePerformance(position: Position, perf: PlayerPerformance): number {
  if (perf.minutes <= 0) return 0;

  let points = perf.minutes >= 60 ? 2 : 1;
  points += perf.goals * GOAL_POINTS[position];
  points += perf.assists * 3;

  if (perf.cleanSheet && perf.minutes >= 60) {
    points += CLEAN_SHEET_POINTS[position];
  }
  if (position === 'GK' || position === 'DEF') {
    points -= Math.floor(perf.goalsConceded / 2);
  }
  if (position === 'GK') {
    points += Math.floor(perf.saves / 3);
    points += perf.penaltiesSaved * 5;
  }

  points -= perf.yellowCards;
  points -= perf.redCards * 3;
  points -= perf.ownGoals * 2;
  points -= perf.penaltiesMissed * 2;

  return points;
}

export type TeamPick = {
  playerId: string;
  starter: boolean;
  captain: boolean;
};

export function computeTeamPoints(
  picks: TeamPick[],
  pointsByPlayer: Record<string, number>,
): number {
  let total = 0;
  for (const pick of picks) {
    if (!pick.starter) continue;
    const points = pointsByPlayer[pick.playerId] ?? 0;
    total += points;
    if (pick.captain) total += points;
  }
  return total;
}
