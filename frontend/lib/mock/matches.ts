import type { MatchInfo } from "@/types";

const HOUR = 3600_000;

const NOW_REFERENCE = 1_716_460_800_000;

export const MATCHES: ReadonlyArray<MatchInfo> = [
  {
    id: "ARG-MEX",
    home: "ARG",
    homeFlag: "🇦🇷",
    away: "MEX",
    awayFlag: "🇲🇽",
    scoreHome: 2,
    scoreAway: 1,
    minute: 67,
    phase: "second-half",
    kickoffAt: NOW_REFERENCE - HOUR,
    group: "C",
    venue: "Estadio Lusail",
  },
  {
    id: "FRA-GER",
    home: "FRA",
    homeFlag: "🇫🇷",
    away: "GER",
    awayFlag: "🇩🇪",
    scoreHome: 1,
    scoreAway: 1,
    minute: 42,
    phase: "first-half",
    kickoffAt: NOW_REFERENCE - 42 * 60_000,
    group: "B",
    venue: "Estadio Azteca",
  },
  {
    id: "BRA-POR",
    home: "BRA",
    homeFlag: "🇧🇷",
    away: "POR",
    awayFlag: "🇵🇹",
    scoreHome: 0,
    scoreAway: 0,
    minute: null,
    phase: "kickoff-soon",
    kickoffAt: NOW_REFERENCE + 30 * 60_000,
    group: "F",
    venue: "MetLife Stadium",
  },
  {
    id: "ESP-NED",
    home: "ESP",
    homeFlag: "🇪🇸",
    away: "NED",
    awayFlag: "🇳🇱",
    scoreHome: 3,
    scoreAway: 2,
    minute: null,
    phase: "fulltime",
    kickoffAt: NOW_REFERENCE - 4 * HOUR,
    group: "A",
    venue: "Stade de France",
  },
  {
    id: "ENG-USA",
    home: "ENG",
    homeFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    away: "USA",
    awayFlag: "🇺🇸",
    scoreHome: 1,
    scoreAway: 1,
    minute: null,
    phase: "scheduled",
    kickoffAt: NOW_REFERENCE + 6 * HOUR,
    group: "D",
    venue: "SoFi Stadium",
  },
  {
    id: "JPN-BEL",
    home: "JPN",
    homeFlag: "🇯🇵",
    away: "BEL",
    awayFlag: "🇧🇪",
    scoreHome: 0,
    scoreAway: 0,
    minute: null,
    phase: "scheduled",
    kickoffAt: NOW_REFERENCE + 24 * HOUR,
    group: "G",
    venue: "Azteca",
  },
];

export const LIVE_MATCH = MATCHES[0];

export function matchById(id: string): MatchInfo | undefined {
  return MATCHES.find((m) => m.id === id);
}
