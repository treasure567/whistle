import { MATCHES } from "@/lib/mock/matches";
import type { MatchInfo, MatchPhase } from "@/types";
import { apiGet } from "./client";
import { matchRecordsSchema, type MatchRecord } from "./schemas";

export type MatchFeed = {
  matches: MatchInfo[];
  source: "live" | "sample";
};

function statusToPhase(status: string): MatchPhase {
  switch (status.toUpperCase()) {
    case "1H":
      return "first-half";
    case "HT":
      return "halftime";
    case "2H":
      return "second-half";
    case "ET":
      return "extra-time";
    case "FT":
    case "AET":
    case "PEN":
      return "fulltime";
    default:
      return "scheduled";
  }
}

function toMatchInfo(record: MatchRecord): MatchInfo {
  return {
    id: record.externalId,
    home: record.homeCode,
    homeFlag: record.homeCode,
    away: record.awayCode,
    awayFlag: record.awayCode,
    scoreHome: 0,
    scoreAway: 0,
    minute: null,
    phase: statusToPhase(record.status),
    kickoffAt: Date.parse(record.kickoffAt),
    group: "",
    venue: "",
  };
}

export async function fetchMatches(): Promise<MatchFeed> {
  try {
    const records = await apiGet("/matches", matchRecordsSchema);
    if (records.length === 0) {
      return { matches: [...MATCHES], source: "sample" };
    }
    return { matches: records.map(toMatchInfo), source: "live" };
  } catch {
    return { matches: [...MATCHES], source: "sample" };
  }
}
