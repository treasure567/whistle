import { createPrismaClient } from '../src/index.js';

const SQUAD_URL = 'https://v3.football.api-sports.io/players/squads?team=';

const TEAM_IDS: Record<string, number> = {
  CAN: 5529, MEX: 16, USA: 2384, ALG: 1532, ARG: 26, AUS: 20, AUT: 775, BEL: 1,
  BIH: 1113, BRA: 6, CPV: 1533, COL: 8, COD: 1508, CIV: 1501, CRO: 3, CUW: 5530,
  CZE: 770, ECU: 2382, EGY: 32, ENG: 10, FRA: 2, GER: 25, GHA: 1504, HAI: 2386,
  IRN: 22, IRQ: 1567, JPN: 12, JOR: 1548, KOR: 17, MAR: 31, NED: 1118, NZL: 4673,
  NOR: 1090, PAN: 11, PAR: 2380, POR: 27, QAT: 1569, KSA: 23, SCO: 1108, SEN: 13,
  RSA: 1531, ESP: 9, SWE: 5, SUI: 15, TUN: 28, TUR: 777, URU: 7, UZB: 1568,
};

const SUFFIXES = new Set(['jr', 'junior', 'ii', 'iii', 'iv']);

type SquadResponse = {
  response?: { players?: { name?: string; photo?: string }[] }[];
};

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

function tokens(name: string): string[] {
  const parts = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(' ')
    .filter(Boolean);
  while (parts.length > 1 && SUFFIXES.has(parts[parts.length - 1]!)) parts.pop();
  return parts;
}

async function fetchSquad(
  apiKey: string,
  id: number,
): Promise<{ status: number; players: { name: string; photo: string }[] }> {
  try {
    const res = await fetch(`${SQUAD_URL}${id}`, { headers: { 'x-apisports-key': apiKey } });
    if (!res.ok) return { status: res.status, players: [] };
    const data = (await res.json()) as SquadResponse;
    const raw = data.response?.[0]?.players ?? [];
    const players = raw
      .filter((p): p is { name: string; photo: string } => Boolean(p.name && p.photo))
      .map((p) => ({ name: p.name, photo: p.photo }));
    return { status: 200, players };
  } catch {
    return { status: 0, players: [] };
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to enrich photos');
  }
  const apiKey = process.env.API_FOOTBALL_KEY;
  if (!apiKey) {
    throw new Error('API_FOOTBALL_KEY is required to enrich photos');
  }

  const prisma = createPrismaClient({ databaseUrl });
  try {
    const players = await prisma.player.findMany({ select: { id: true, name: true, teamCode: true } });
    const byTeam = new Map<string, { id: string; name: string }[]>();
    for (const player of players) {
      const list = byTeam.get(player.teamCode) ?? [];
      list.push({ id: player.id, name: player.name });
      byTeam.set(player.teamCode, list);
    }

    const updates: { id: string; photo: string | null }[] = [];
    let squads = 0;
    let headshots = 0;
    let backoffs = 0;

    for (const [code, teamId] of Object.entries(TEAM_IDS)) {
      const dbPlayers = byTeam.get(code) ?? [];
      if (dbPlayers.length === 0) continue;

      let squad = await fetchSquad(apiKey, teamId);
      if (squad.status === 429) {
        backoffs += 1;
        if (backoffs > 10) {
          console.log('rate limited repeatedly; stopping early');
          break;
        }
        await sleep(60_000);
        squad = await fetchSquad(apiKey, teamId);
      }
      squads += 1;

      const byFull = new Map<string, string>();
      const byInitialSurname = new Map<string, string>();
      const bySurname = new Map<string, string>();
      const surnameCount = new Map<string, number>();
      for (const apiPlayer of squad.players) {
        const parts = tokens(apiPlayer.name);
        if (parts.length === 0) continue;
        const surname = parts[parts.length - 1]!;
        byFull.set(parts.join(' '), apiPlayer.photo);
        const initialKey = `${parts[0]![0]}:${surname}`;
        if (!byInitialSurname.has(initialKey)) byInitialSurname.set(initialKey, apiPlayer.photo);
        surnameCount.set(surname, (surnameCount.get(surname) ?? 0) + 1);
        bySurname.set(surname, apiPlayer.photo);
      }

      const haveSquad = squad.players.length > 0;
      for (const dbPlayer of dbPlayers) {
        const parts = tokens(dbPlayer.name);
        const surname = parts[parts.length - 1];
        const photo =
          parts.length === 0
            ? undefined
            : byFull.get(parts.join(' ')) ??
              byInitialSurname.get(`${parts[0]![0]}:${surname}`) ??
              (surname && surnameCount.get(surname) === 1 ? bySurname.get(surname) : undefined);
        if (photo) {
          updates.push({ id: dbPlayer.id, photo });
          headshots += 1;
        } else if (haveSquad) {
          updates.push({ id: dbPlayer.id, photo: null });
        }
      }

      await sleep(6500);
    }

    for (let i = 0; i < updates.length; i += 20) {
      await Promise.all(
        updates.slice(i, i + 20).map((u) => prisma.player.update({ where: { id: u.id }, data: { photo: u.photo } })),
      );
    }

    console.log(`api-football: fetched ${squads} squads, set ${headshots} headshots`);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
