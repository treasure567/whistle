import { apiPost } from "@/lib/api/client";
import { simMatchSchema, type SimMatchPayload } from "@/lib/api/schemas";
import type { SimEvent, SimResult, SimTeam } from "@/lib/sim/engine";

function hashCode(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function eventText(e: SimMatchPayload["events"][number], home: SimTeam, away: SimTeam): string {
  const code = e.side === "home" ? home.code : e.side === "away" ? away.code : "";
  switch (e.type) {
    case "kickoff":
      return "Kick-off";
    case "halftime":
      return "Half-time";
    case "fulltime":
      return "Full-time";
    case "goal":
      return `GOAL${e.player ? ` ${e.player}` : ""} (${code})`;
    case "penalty-goal":
      return `Penalty scored${e.player ? ` by ${e.player}` : ""} (${code})`;
    case "penalty-miss":
      return `Penalty missed${e.player ? ` by ${e.player}` : ""} (${code})`;
    case "save":
      return `Save denies ${e.player ?? code}`;
    case "chance":
      return `${e.player ?? code} goes close`;
    case "corner":
      return `Corner, ${code}`;
    case "yellow":
      return `Yellow card${e.player ? ` for ${e.player}` : ""} (${code})`;
    case "red":
      return `Red card${e.player ? ` ${e.player}` : ""} (${code})`;
    case "sub":
      return e.text ?? `Substitution (${code})`;
    default:
      return "";
  }
}

// Asks the backend to model the tie with the LLM and maps it onto the local
// SimResult shape. Returns null on any failure so callers fall back to the
// deterministic engine and the match still plays.
export async function fetchLlmMatch(home: SimTeam, away: SimTeam, variant: number): Promise<SimResult | null> {
  let payload: SimMatchPayload;
  try {
    payload = await apiPost(
      "/sim/match",
      {
        home: { code: home.code, name: home.name, strength: home.strength, players: home.players.slice(0, 16) },
        away: { code: away.code, name: away.name, strength: away.strength, players: away.players.slice(0, 16) },
        variant,
      },
      simMatchSchema,
    );
  } catch {
    return null;
  }
  if (payload.source !== "llm" || payload.events.length === 0) return null;

  const events: SimEvent[] = payload.events.map((e) => ({
    minute: e.minute,
    type: e.type,
    side: e.side,
    ...(e.player ? { player: e.player } : {}),
    text: eventText(e, home, away),
  }));

  const seed = (hashCode(`${home.code}-${away.code}`) ^ Math.imul(variant + 1, 0x9e3779b1)) >>> 0;
  return {
    seed,
    home,
    away,
    homeScore: payload.homeScore,
    awayScore: payload.awayScore,
    events,
    stats: payload.stats,
    motm: payload.motm,
  };
}
