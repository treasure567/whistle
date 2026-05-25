import { simulateMatch, type SimTeam } from "./engine";

export type GroupRow = {
  team: SimTeam;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
  rank: number;
};

export type Group = { name: string; rows: GroupRow[] };

export type KnockoutTie = {
  home: SimTeam | null;
  away: SimTeam | null;
  homeScore: number;
  awayScore: number;
  winner: SimTeam | null;
  pens: boolean;
};

export type KnockoutRound = { name: string; ties: KnockoutTie[] };

export type Tournament = {
  groups: Group[];
  rounds: KnockoutRound[];
  champion: SimTeam | null;
  qualified: string[];
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function emptyRow(team: SimTeam): GroupRow {
  return { team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0, rank: 0 };
}

function rankRows(rows: GroupRow[]): GroupRow[] {
  const sorted = [...rows].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  sorted.forEach((r, i) => (r.rank = i + 1));
  return sorted;
}

function roundName(size: number): string {
  if (size === 2) return "Final";
  if (size === 4) return "Semi-finals";
  if (size === 8) return "Quarter-finals";
  if (size === 16) return "Round of 16";
  if (size === 32) return "Round of 32";
  return `Round of ${size}`;
}

function decisiveWinner(home: SimTeam, away: SimTeam, hs: number, as: number): { winner: SimTeam; pens: boolean } {
  if (hs > as) return { winner: home, pens: false };
  if (as > hs) return { winner: away, pens: false };
  // shootout, weighted by strength
  const share = home.strength / (home.strength + away.strength);
  return { winner: Math.random() < share ? home : away, pens: true };
}

export function simulateTournament(teams: SimTeam[]): Tournament {
  const groupCount = Math.min(12, Math.floor(teams.length / 4));
  if (groupCount < 2) return { groups: [], rounds: [], champion: null, qualified: [] };

  const pool = [...teams].sort((a, b) => b.strength - a.strength).slice(0, groupCount * 4);
  const drawn = shuffle(pool);

  // group stage
  const groups: Group[] = [];
  const thirds: GroupRow[] = [];
  const winners: GroupRow[] = [];
  const runnersUp: GroupRow[] = [];

  for (let g = 0; g < groupCount; g += 1) {
    const members = drawn.slice(g * 4, g * 4 + 4);
    const rows = new Map(members.map((t) => [t.code, emptyRow(t)]));
    for (let i = 0; i < members.length; i += 1) {
      for (let j = i + 1; j < members.length; j += 1) {
        const home = members[i]!;
        const away = members[j]!;
        const res = simulateMatch(home, away);
        const h = rows.get(home.code)!;
        const a = rows.get(away.code)!;
        h.played += 1;
        a.played += 1;
        h.gf += res.homeScore;
        h.ga += res.awayScore;
        a.gf += res.awayScore;
        a.ga += res.homeScore;
        if (res.homeScore > res.awayScore) {
          h.won += 1;
          h.pts += 3;
          a.lost += 1;
        } else if (res.awayScore > res.homeScore) {
          a.won += 1;
          a.pts += 3;
          h.lost += 1;
        } else {
          h.drawn += 1;
          a.drawn += 1;
          h.pts += 1;
          a.pts += 1;
        }
      }
    }
    const ranked = rankRows([...rows.values()].map((r) => ({ ...r, gd: r.gf - r.ga })));
    groups.push({ name: String.fromCharCode(65 + g), rows: ranked });
    if (ranked[0]) winners.push(ranked[0]);
    if (ranked[1]) runnersUp.push(ranked[1]);
    if (ranked[2]) thirds.push(ranked[2]);
  }

  // qualifiers -> largest power of two we can fill
  const base = winners.length + runnersUp.length;
  let target = 2;
  while (target * 2 <= base + thirds.length) target *= 2;
  const sortRows = (rs: GroupRow[]) => [...rs].sort((a, b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);
  const seeds: SimTeam[] = [
    ...sortRows(winners),
    ...sortRows(runnersUp),
    ...sortRows(thirds).slice(0, Math.max(0, target - base)),
  ]
    .slice(0, target)
    .map((r) => r.team);

  // bracket: seed i vs seed (n-1-i)
  const rounds: KnockoutRound[] = [];
  let current: SimTeam[] = [];
  for (let i = 0; i < seeds.length / 2; i += 1) {
    current.push(seeds[i]!, seeds[seeds.length - 1 - i]!);
  }

  while (current.length >= 2) {
    const ties: KnockoutTie[] = [];
    const advancing: SimTeam[] = [];
    for (let i = 0; i < current.length; i += 2) {
      const home = current[i]!;
      const away = current[i + 1]!;
      const res = simulateMatch(home, away);
      const { winner, pens } = decisiveWinner(home, away, res.homeScore, res.awayScore);
      ties.push({ home, away, homeScore: res.homeScore, awayScore: res.awayScore, winner, pens });
      advancing.push(winner);
    }
    rounds.push({ name: roundName(current.length), ties });
    current = advancing;
  }

  return { groups, rounds, champion: current[0] ?? null, qualified: seeds.map((t) => t.code) };
}
