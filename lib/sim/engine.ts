export type SimEventType =
  | "kickoff"
  | "goal"
  | "chance"
  | "save"
  | "corner"
  | "yellow"
  | "red"
  | "penalty-goal"
  | "penalty-miss"
  | "sub"
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

export type MatchStats = {
  possessionHome: number;
  shotsHome: number;
  shotsAway: number;
  sotHome: number;
  sotAway: number;
  cornersHome: number;
  cornersAway: number;
  foulsHome: number;
  foulsAway: number;
  offsidesHome: number;
  offsidesAway: number;
};

export type Motm = { player: string; side: "home" | "away"; rating: number };

export type SimResult = {
  seed: number;
  home: SimTeam;
  away: SimTeam;
  homeScore: number;
  awayScore: number;
  events: SimEvent[];
  stats: MatchStats;
  motm: Motm | null;
};

export type MatchOdds = { home: number; draw: number; away: number };

/// Decimal odds derived from team strength, with a small bookmaker margin.
export function matchOdds(homeStrength: number, awayStrength: number): MatchOdds {
  const hs = Math.max(0.2, homeStrength) * 1.1;
  const as = Math.max(0.2, awayStrength);
  const homeShare = hs / (hs + as);
  const drawP = 0.26;
  const odd = (p: number) => Math.max(1.05, Math.round((1 / Math.max(0.02, p)) * 0.92 * 100) / 100);
  return {
    home: odd(homeShare * (1 - drawP)),
    draw: odd(drawP),
    away: odd((1 - homeShare) * (1 - drawP)),
  };
}

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
  let shotsH = 0;
  let shotsA = 0;
  let sotH = 0;
  let sotA = 0;
  let cornersH = 0;
  let cornersA = 0;
  const goals = new Map<string, { count: number; side: "home" | "away" }>();

  const scoreFor = (side: "home" | "away", minute: number, kind: "open" | "penalty") => {
    const team = side === "home" ? home : away;
    const scorer = pickScorer(team.players, rand);
    if (side === "home") {
      homeScore += 1;
      shotsH += 1;
      sotH += 1;
    } else {
      awayScore += 1;
      shotsA += 1;
      sotA += 1;
    }
    if (scorer) {
      const g = goals.get(scorer) ?? { count: 0, side };
      g.count += 1;
      goals.set(scorer, g);
    }
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

    if (rand() < 0.0045) {
      const side: "home" | "away" = rand() < homeShare ? "home" : "away";
      const team = side === "home" ? home : away;
      if (side === "home") shotsH += 1;
      else shotsA += 1;
      if (rand() < 0.76) {
        if (side === "home") sotH += 1;
        else sotA += 1;
        scoreFor(side, m, "penalty");
      } else {
        const taker = pickScorer(team.players, rand);
        events.push({ minute: m, type: "penalty-miss", side, ...(taker ? { player: taker } : {}), text: `Penalty missed${taker ? ` by ${taker}` : ""} (${team.code})` });
      }
    }

    if (rand() < homeGoalP) scoreFor("home", m, "open");
    if (rand() < awayGoalP) scoreFor("away", m, "open");

    if (rand() < 0.16) {
      const side: "home" | "away" = rand() < homeShare ? "home" : "away";
      const team = side === "home" ? home : away;
      const player = pickScorer(team.players, rand);
      const saved = rand() < 0.5;
      if (side === "home") {
        shotsH += 1;
        if (saved) sotH += 1;
      } else {
        shotsA += 1;
        if (saved) sotA += 1;
      }
      events.push({
        minute: m,
        type: saved ? "save" : "chance",
        side,
        ...(player ? { player } : {}),
        text: saved ? `Great save denies ${player ?? team.code}` : `${player ?? team.code} fires just wide`,
      });
    }

    if (rand() < 0.07 * (homeShare + 0.45)) {
      cornersH += 1;
      if (rand() < 0.3) events.push({ minute: m, type: "corner", side: "home", text: `Corner, ${home.code}` });
    }
    if (rand() < 0.07 * (1 - homeShare + 0.45)) {
      cornersA += 1;
      if (rand() < 0.3) events.push({ minute: m, type: "corner", side: "away", text: `Corner, ${away.code}` });
    }

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

  const stats: MatchStats = {
    possessionHome: Math.max(35, Math.min(65, Math.round(50 + (homeShare - 0.5) * 36 + (rand() - 0.5) * 8))),
    shotsHome: shotsH,
    shotsAway: shotsA,
    sotHome: sotH,
    sotAway: sotA,
    cornersHome: cornersH,
    cornersAway: cornersA,
    foulsHome: 7 + Math.floor(rand() * 9),
    foulsAway: 7 + Math.floor(rand() * 9),
    offsidesHome: Math.floor(rand() * 5),
    offsidesAway: Math.floor(rand() * 5),
  };

  let motm: Motm | null = null;
  let topGoals = 0;
  for (const [player, g] of goals) {
    if (g.count > topGoals) {
      topGoals = g.count;
      motm = { player, side: g.side, rating: Math.round((g.count >= 2 ? 9 + rand() * 0.6 : 8 + rand() * 0.7) * 10) / 10 };
    }
  }
  if (!motm) {
    const winner: "home" | "away" = homeScore >= awayScore ? "home" : "away";
    const star = (winner === "home" ? home : away).players[0];
    if (star) motm = { player: star, side: winner, rating: Math.round((7 + rand() * 0.7) * 10) / 10 };
  }

  return { seed, home, away, homeScore, awayScore, events, stats, motm };
}
