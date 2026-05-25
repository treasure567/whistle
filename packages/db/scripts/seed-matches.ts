import { Prisma, createPrismaClient } from '../src/index.js';

const FIXTURES_API =
  'https://api.fifa.com/api/v3/calendar/matches?idCompetition=17&idSeason=285023&count=200&language=en';

type Localized = { Description?: string }[] | null | undefined;
type Side = { IdCountry?: string | null } | null | undefined;
type Stadium = { Name?: Localized; CityName?: Localized; IdCountry?: string | null } | null;

type FifaMatch = {
  MatchNumber?: number;
  Date?: string;
  GroupName?: Localized;
  StageName?: Localized;
  Home?: Side;
  Away?: Side;
  PlaceHolderA?: string | null;
  PlaceHolderB?: string | null;
  Stadium?: Stadium;
};

function desc(value: Localized): string | null {
  return value?.[0]?.Description ?? null;
}

function teamCode(side: Side, placeholder: string | null | undefined): string {
  return side?.IdCountry ?? placeholder ?? 'TBD';
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to seed matches');
  }

  const response = await fetch(FIXTURES_API, { headers: { 'user-agent': 'whistle-seed/1.0' } });
  if (!response.ok) {
    throw new Error(`fifa fetch failed: ${response.status}`);
  }
  const body = (await response.json()) as { Results?: FifaMatch[] };
  const results = body.Results ?? [];
  if (results.length === 0) {
    throw new Error('fifa returned no fixtures');
  }

  const prisma = createPrismaClient({ databaseUrl });
  try {
    let count = 0;
    for (const match of results) {
      if (typeof match.MatchNumber !== 'number' || !match.Date) continue;
      const externalId = `wc-m${match.MatchNumber}`;
      const homeCode = teamCode(match.Home, match.PlaceHolderA);
      const awayCode = teamCode(match.Away, match.PlaceHolderB);
      const kickoffAt = new Date(match.Date);
      const payload = {
        source: 'fifa',
        matchNumber: match.MatchNumber,
        group: desc(match.GroupName),
        stage: desc(match.StageName),
        venue: desc(match.Stadium?.Name),
        city: desc(match.Stadium?.CityName),
        venueCountry: match.Stadium?.IdCountry ?? null,
        note: '',
      } as Prisma.InputJsonValue;

      await prisma.match.upsert({
        where: { externalId },
        create: { externalId, homeCode, awayCode, kickoffAt, status: 'NS', payload },
        update: { homeCode, awayCode, kickoffAt, status: 'NS', payload },
      });
      count += 1;
    }
    console.log(`seeded ${count} World Cup 2026 fixtures`);
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
