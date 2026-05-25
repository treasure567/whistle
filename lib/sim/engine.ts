export type SimEventType =
  | "kickoff"
  | "goal"
  | "chance"
  | "save"
  | "yellow"
  | "red"
  | "penalty-goal"
  | "penalty-miss"
  | "halftime"
  | "fulltime";

export type SimSide = "home" | "away" | "neutral";

export type SimEvent = {
  minute: number;
  type: SimEventType;
  side: SimSide;
  player?: string;
  text: string;
};

export type SimTeam = {
  name: string;
  code: string;
  strength: number; // 0..1
  players: string[];
};

export type SimResult = {
  seed: number;
  home: SimTeam;
  away: SimTeam;
  homeScore: number;
  awayScore: number;
  events: SimEvent[];
};

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Front-biased scorer: forwards/stars (listed first) score more often.
function pickScorer(players: string[], rand: () => number): string | undefined {
  if (players.length === 0) return undefined;
  const pool = players.slice(0, Math.min(players.length, 11));
  const weights = pool.map((_, i) => 1 / (i + 1.4));
  const total = weights.reduce((s, w) => s + w, 0);
  let r = rand() * total;
  for (let i = 0; i < pool.length; i += 1) {
    r -= weights[i]!;
    if (r <= 0) return pool[i];
  }
  return pool[0];
}

const GOAL_TOTAL_XG = 2.55; // tuned expected goals per match across both sides

export function simulateMatch(home: SimTeam, away: SimTeam, seedInput?: number): SimResult {
  const seed = seedInput ?? Math.floor(Math.random() * 2 ** 31);
  const rand = mulberry32(seed);

  const hs = Math.max(0.2, home.strength);
  const as = Math.max(0.2, away.strength);
  const homeShare = (hs * 1.12) / (hs * 1.12 + as); // home advantage
  const homeXg = GOAL_TOTAL_XG * homeShare;
  const awayXg = GOAL_TOTAL_XG * (1 - homeShare);
  const homeGoalP = homeXg / 90;
  const awayGoalP = awayXg / 90;

  const events: SimEvent[] = [{ minute: 0, type: "kickoff", side: "neutral", text: "Kick-off" }];
  let homeScore = 0;
  let awayScore = 0;
  let halftimeDone = false;

  const scoreFor = (side: "home" | "away", minute: number, kind: "open" | "penalty") => {
    const team = side === "home" ? home : away;
    const scorer = pickScorer(team.players, rand);
    if (side === "home") homeScore += 1;
    else awayScore += 1;
    events.push({
      minute,
      type: kind === "penalty" ? "penalty-goal" : "goal",
      side,
      ...(scorer ? { player: scorer } : {}),
      text:
        kind === "penalty"
          ? `Penalty scored${scorer ? ` by ${scorer}` : ""} (${team.code})`
          : `GOAL${scorer ? ` ${scorer}` : ""} (${team.code})`,
    });
  };

  for (let m = 1; m <= 90; m += 1) {
    if (m === 45 && !halftimeDone) {
      events.push({ minute: 45, type: "halftime", side: "neutral", text: `Half-time: ${home.code} ${homeScore}-${awayScore} ${away.code}` });
      halftimeDone = true;
    }

    // penalties (rare)
    if (rand() < 0.0045) {
      const side: "home" | "away" = rand() < homeShare ? "home" : "away";
      const team = side === "home" ? home : away;
      if (rand() < 0.76) {
        scoreFor(side, m, "penalty");
      } else {
        const taker = pickScorer(team.players, rand);
        events.push({ minute: m, type: "penalty-miss", side, ...(taker ? { player: taker } : {}), text: `Penalty missed${taker ? ` by ${taker}` : ""} (${team.code})` });
      }
    }

    // goals
    if (rand() < homeGoalP) scoreFor("home", m, "open");
    if (rand() < awayGoalP) scoreFor("away", m, "open");

    // chances / saves (flavour)
    if (rand() < 0.16) {
      const side: "home" | "away" = rand() < homeShare ? "home" : "away";
      const team = side === "home" ? home : away;
      const player = pickScorer(team.players, rand);
      const saved = rand() < 0.5;
      events.push({
        minute: m,
        type: saved ? "save" : "chance",
        side,
        ...(player ? { player } : {}),
        text: saved ? `Great save denies ${player ?? team.code}` : `${player ?? team.code} fires just wide`,
      });
    }

    // cards
    if (rand() < 0.035) {
      const side: "home" | "away" = rand() < 0.5 ? "home" : "away";
      const team = side === "home" ? home : away;
      const player = pickScorer(team.players, rand);
      events.push({ minute: m, type: "yellow", side, ...(player ? { player } : {}), text: `Yellow card${player ? ` for ${player}` : ""} (${team.code})` });
    }
    if (rand() < 0.0045) {
      const side: "home" | "away" = rand() < 0.5 ? "home" : "away";
      const team = side === "home" ? home : away;
      const player = pickScorer(team.players, rand);
      events.push({ minute: m, type: "red", side, ...(player ? { player } : {}), text: `RED CARD${player ? ` ${player}` : ""} (${team.code})` });
    }
  }

  events.push({ minute: 90, type: "fulltime", side: "neutral", text: `Full-time: ${home.code} ${homeScore}-${awayScore} ${away.code}` });
  events.sort((a, b) => a.minute - b.minute);

  return { seed, home, away, homeScore, awayScore, events };
}
