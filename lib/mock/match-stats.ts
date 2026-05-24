import type { MatchStats } from "@/types";

export const MATCH_STATS: Record<string, MatchStats> = {
  "ARG-MEX": {
    matchId: "ARG-MEX",
    possession: { home: 58, away: 42 },
    shots: { home: 14, away: 7 },
    shotsOnTarget: { home: 6, away: 3 },
    corners: { home: 5, away: 2 },
    fouls: { home: 8, away: 12 },
    yellowCards: { home: 1, away: 3 },
    redCards: { home: 0, away: 0 },
    offsides: { home: 2, away: 1 },
    passes: { home: 482, away: 318 },
    passAccuracy: { home: 86, away: 79 },
  },
  "FRA-GER": {
    matchId: "FRA-GER",
    possession: { home: 51, away: 49 },
    shots: { home: 6, away: 5 },
    shotsOnTarget: { home: 2, away: 2 },
    corners: { home: 2, away: 3 },
    fouls: { home: 6, away: 7 },
    yellowCards: { home: 0, away: 1 },
    redCards: { home: 0, away: 0 },
    offsides: { home: 1, away: 2 },
    passes: { home: 220, away: 215 },
    passAccuracy: { home: 88, away: 87 },
  },
  "ESP-NED": {
    matchId: "ESP-NED",
    possession: { home: 64, away: 36 },
    shots: { home: 18, away: 11 },
    shotsOnTarget: { home: 9, away: 5 },
    corners: { home: 8, away: 4 },
    fouls: { home: 11, away: 14 },
    yellowCards: { home: 2, away: 3 },
    redCards: { home: 0, away: 1 },
    offsides: { home: 3, away: 2 },
    passes: { home: 712, away: 401 },
    passAccuracy: { home: 89, away: 81 },
  },
};

export function statsByMatchId(id: string): MatchStats | undefined {
  return MATCH_STATS[id];
}
