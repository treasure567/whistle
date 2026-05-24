import { SQUADS } from "@/lib/mock/squads";
import type {
  LineupPlayer,
  MatchEvent,
  MatchEventType,
  MatchLineup,
  SquadPlayer,
} from "@/types";

type Bucket = "Goalkeeper" | "Defender" | "Midfielder" | "Attacker";

function bucket(pos: string | null): Bucket {
  if (!pos) return "Midfielder";
  if (pos.includes("Goalkeeper")) return "Goalkeeper";
  if (pos.includes("Defender")) return "Defender";
  if (pos.includes("Attacker") || pos.includes("Forward")) return "Attacker";
  return "Midfielder";
}

function pickN(
  nation: string,
  group: Bucket,
  n: number,
  used: Set<number>,
): SquadPlayer[] {
  const squad = SQUADS[nation];
  if (!squad) return [];
  const sorted = [...squad.players]
    .filter((p) => p.number != null && !used.has(p.number))
    .sort((a, b) => (a.number ?? 999) - (b.number ?? 999));
  const primary = sorted.filter((p) => bucket(p.position) === group);
  const picked = primary.slice(0, n);
  if (picked.length < n) {
    const fallback = sorted.filter(
      (p) => bucket(p.position) !== group && !picked.includes(p),
    );
    picked.push(...fallback.slice(0, n - picked.length));
  }
  for (const p of picked) if (p.number != null) used.add(p.number);
  return picked;
}

function buildLineup(nation: string, formation: string): LineupPlayer[] {
  const used = new Set<number>();
  const out: LineupPlayer[] = [];

  const push = (players: SquadPlayer[], row: LineupPlayer["row"]) => {
    for (const p of players) {
      if (p.number != null) out.push({ nation, jersey: p.number, row });
    }
  };

  push(pickN(nation, "Goalkeeper", 1, used), "gk");
  const parts = formation.split("-").map(Number);
  push(pickN(nation, "Defender", parts[0] ?? 4, used), "df");

  if (parts.length === 3) {
    push(pickN(nation, "Midfielder", parts[1] ?? 3, used), "cm");
    push(pickN(nation, "Attacker", parts[2] ?? 3, used), "fw");
  } else if (parts.length === 4) {
    push(pickN(nation, "Midfielder", parts[1] ?? 2, used), "cdm");
    push(pickN(nation, "Midfielder", parts[2] ?? 3, used), "cam");
    push(pickN(nation, "Attacker", parts[3] ?? 1, used), "fw");
  } else {
    push(pickN(nation, "Midfielder", 3, used), "cm");
    push(pickN(nation, "Attacker", 3, used), "fw");
  }

  return out;
}

interface MatchFormation {
  matchId: string;
  home: { code: string; formation: string };
  away: { code: string; formation: string };
}

const MATCH_FORMATIONS: ReadonlyArray<MatchFormation> = [
  {
    matchId: "ARG-MEX",
    home: { code: "ARG", formation: "4-3-3" },
    away: { code: "MEX", formation: "4-4-2" },
  },
  {
    matchId: "FRA-GER",
    home: { code: "FRA", formation: "4-2-3-1" },
    away: { code: "GER", formation: "4-3-3" },
  },
  {
    matchId: "BRA-POR",
    home: { code: "BRA", formation: "4-3-3" },
    away: { code: "POR", formation: "4-4-2" },
  },
  {
    matchId: "ESP-NED",
    home: { code: "ESP", formation: "4-3-3" },
    away: { code: "NED", formation: "3-5-2" },
  },
  {
    matchId: "ENG-USA",
    home: { code: "ENG", formation: "4-3-3" },
    away: { code: "USA", formation: "4-2-3-1" },
  },
  {
    matchId: "JPN-BEL",
    home: { code: "JPN", formation: "4-2-3-1" },
    away: { code: "BEL", formation: "3-4-3" },
  },
];

export const MATCH_LINEUPS: ReadonlyArray<MatchLineup> = MATCH_FORMATIONS.map(
  (m) => ({
    matchId: m.matchId,
    homeFormation: m.home.formation,
    awayFormation: m.away.formation,
    home: buildLineup(m.home.code, m.home.formation),
    away: buildLineup(m.away.code, m.away.formation),
  }),
);

interface EventSeed {
  id: string;
  matchId: string;
  type: MatchEventType;
  minute: number;
  team: "home" | "away";
  slot: number;
  detail?: string;
}

const EVENT_SEEDS: ReadonlyArray<EventSeed> = [
  { id: "ev-001", matchId: "ARG-MEX", type: "goal", minute: 23, team: "home", slot: 9 },
  { id: "ev-002", matchId: "ARG-MEX", type: "goal", minute: 41, team: "away", slot: 10 },
  { id: "ev-003", matchId: "ARG-MEX", type: "yellow-card", minute: 52, team: "away", slot: 3 },
  { id: "ev-004", matchId: "ARG-MEX", type: "goal", minute: 61, team: "home", slot: 10 },
  { id: "ev-005", matchId: "ARG-MEX", type: "substitution", minute: 64, team: "home", slot: 7, detail: "Tactical sub" },
  { id: "ev-006", matchId: "FRA-GER", type: "goal", minute: 18, team: "home", slot: 10 },
  { id: "ev-007", matchId: "FRA-GER", type: "goal", minute: 38, team: "away", slot: 9 },
  { id: "ev-008", matchId: "ESP-NED", type: "goal", minute: 12, team: "home", slot: 10 },
  { id: "ev-009", matchId: "ESP-NED", type: "goal", minute: 34, team: "away", slot: 10 },
  { id: "ev-010", matchId: "ESP-NED", type: "goal", minute: 55, team: "home", slot: 9 },
  { id: "ev-011", matchId: "ESP-NED", type: "goal", minute: 71, team: "home", slot: 8 },
  { id: "ev-012", matchId: "ESP-NED", type: "goal", minute: 82, team: "away", slot: 9 },
];

function resolveEvent(seed: EventSeed): MatchEvent | null {
  const lineup = MATCH_LINEUPS.find((l) => l.matchId === seed.matchId);
  if (!lineup) return null;
  const players = seed.team === "home" ? lineup.home : lineup.away;
  const player = players[Math.min(seed.slot, players.length - 1)];
  if (!player) return null;
  return {
    id: seed.id,
    matchId: seed.matchId,
    type: seed.type,
    minute: seed.minute,
    team: seed.team,
    nation: player.nation,
    jersey: player.jersey,
    detail: seed.detail,
  };
}

export const MATCH_EVENTS: ReadonlyArray<MatchEvent> = EVENT_SEEDS.map(
  resolveEvent,
).filter((e): e is MatchEvent => e !== null);

export function lineupByMatchId(id: string): MatchLineup | undefined {
  return MATCH_LINEUPS.find((l) => l.matchId === id);
}

export function eventsByMatchId(id: string): ReadonlyArray<MatchEvent> {
  return MATCH_EVENTS.filter((e) => e.matchId === id).sort(
    (a, b) => a.minute - b.minute,
  );
}
