import { createPrismaClient } from '../src/index.js';

const SQUADS_PAGE = '2026_FIFA_World_Cup_squads';
const WIKI_API = `https://en.wikipedia.org/w/api.php?action=parse&page=${SQUADS_PAGE}&prop=wikitext&format=json&formatversion=2`;

const CODE_TO_NATION: Record<string, string> = {
  CAN: 'Canada', MEX: 'Mexico', USA: 'USA', ALG: 'Algeria', ARG: 'Argentina',
  AUS: 'Australia', AUT: 'Austria', BEL: 'Belgium', BIH: 'Bosnia and Herzegovina',
  BRA: 'Brazil', CPV: 'Cabo Verde', COL: 'Colombia', COD: 'Congo DR',
  CIV: "Cote d'Ivoire", CRO: 'Croatia', CUW: 'Curacao', CZE: 'Czechia',
  ECU: 'Ecuador', EGY: 'Egypt', ENG: 'England', FRA: 'France', GER: 'Germany',
  GHA: 'Ghana', HAI: 'Haiti', IRN: 'IR Iran', IRQ: 'Iraq', JPN: 'Japan',
  JOR: 'Jordan', KOR: 'Korea Republic', MAR: 'Morocco', NED: 'Netherlands',
  NZL: 'New Zealand', NOR: 'Norway', PAN: 'Panama', PAR: 'Paraguay',
  POR: 'Portugal', QAT: 'Qatar', KSA: 'Saudi Arabia', SCO: 'Scotland',
  SEN: 'Senegal', RSA: 'South Africa', ESP: 'Spain', SWE: 'Sweden',
  SUI: 'Switzerland', TUN: 'Tunisia', TUR: 'Turkiye', URU: 'Uruguay', UZB: 'Uzbekistan',
};

const ALIASES: [string[], string][] = [
  [['canada'], 'CAN'], [['mexico'], 'MEX'], [['united states', 'usa'], 'USA'],
  [['algeria'], 'ALG'], [['argentina'], 'ARG'], [['australia'], 'AUS'],
  [['austria'], 'AUT'], [['belgium'], 'BEL'], [['bosnia and herzegovina', 'bosnia'], 'BIH'],
  [['brazil'], 'BRA'], [['cape verde', 'cabo verde'], 'CPV'], [['colombia'], 'COL'],
  [['dr congo', 'democratic republic of the congo', 'congo dr'], 'COD'],
  [['ivory coast', 'cote d ivoire', 'cote divoire'], 'CIV'], [['croatia'], 'CRO'],
  [['curacao'], 'CUW'], [['czech republic', 'czechia'], 'CZE'], [['ecuador'], 'ECU'],
  [['egypt'], 'EGY'], [['england'], 'ENG'], [['france'], 'FRA'], [['germany'], 'GER'],
  [['ghana'], 'GHA'], [['haiti'], 'HAI'], [['iran', 'ir iran'], 'IRN'], [['iraq'], 'IRQ'],
  [['japan'], 'JPN'], [['jordan'], 'JOR'], [['south korea', 'korea republic', 'korea'], 'KOR'],
  [['morocco'], 'MAR'], [['netherlands'], 'NED'], [['new zealand'], 'NZL'], [['norway'], 'NOR'],
  [['panama'], 'PAN'], [['paraguay'], 'PAR'], [['portugal'], 'POR'], [['qatar'], 'QAT'],
  [['saudi arabia'], 'KSA'], [['scotland'], 'SCO'], [['senegal'], 'SEN'],
  [['south africa'], 'RSA'], [['spain'], 'ESP'], [['sweden'], 'SWE'], [['switzerland'], 'SUI'],
  [['tunisia'], 'TUN'], [['turkey', 'turkiye'], 'TUR'], [['uruguay'], 'URU'], [['uzbekistan'], 'UZB'],
];

const POSITION_MAP: Record<string, 'GK' | 'DEF' | 'MID' | 'FWD'> = {
  GK: 'GK', DF: 'DEF', MF: 'MID', FW: 'FWD',
};

const MARQUEE: [string, number][] = [
  ['mbappe', 12.5], ['haaland', 12.0], ['messi', 11.0], ['kane', 11.0], ['vinicius', 10.5],
  ['bellingham', 9.5], ['de bruyne', 9.5], ['salah', 9.5], ['saka', 9.0], ['yamal', 9.0],
  ['pulisic', 9.0], ['isak', 9.0], ['musiala', 8.5], ['wirtz', 8.5], ['foden', 8.5],
  ['rodrygo', 8.5], ['gyokeres', 8.5], ['ronaldo', 8.5], ['lukaku', 8.0], ['griezmann', 8.0],
  ['son', 8.0], ['odegaard', 8.0], ['olise', 8.0], ['palmer', 8.0], ['leao', 8.0],
  ['kvaratskhelia', 8.0], ['nunez', 7.5], ['valverde', 7.5], ['gakpo', 7.5], ['kudus', 7.0],
  ['davies', 7.0], ['mitoma', 7.0], ['bruno fernandes', 8.5], ['rodri', 7.5], ['pedri', 7.5],
];

type FallbackLine = [string, 'GK' | 'DEF' | 'MID' | 'FWD'];

const FALLBACK: Record<string, FallbackLine[]> = {
  CAN: [['M. Crepeau', 'GK'], ['A. Davies', 'DEF'], ['M. Bombito', 'DEF'], ['D. Cornelius', 'DEF'], ['R. Laryea', 'DEF'], ['S. Eustaquio', 'MID'], ['I. Kone', 'MID'], ['J. Osorio', 'MID'], ['J. David', 'FWD'], ['C. Larin', 'FWD'], ['T. Buchanan', 'FWD'], ['J. Hoilett', 'FWD']],
  USA: [['M. Turner', 'GK'], ['S. Dest', 'DEF'], ['A. Robinson', 'DEF'], ['C. Richards', 'DEF'], ['T. Ream', 'DEF'], ['W. McKennie', 'MID'], ['T. Adams', 'MID'], ['Y. Musah', 'MID'], ['C. Pulisic', 'FWD'], ['F. Balogun', 'FWD'], ['T. Weah', 'FWD'], ['G. Reyna', 'FWD']],
  ALG: [['A. Mandrea', 'GK'], ['A. Mandi', 'DEF'], ['R. Bensebaini', 'DEF'], ['Y. Atal', 'DEF'], ['M. Tougai', 'DEF'], ['I. Bennacer', 'MID'], ['H. Aouar', 'MID'], ['N. Bentaleb', 'MID'], ['R. Mahrez', 'FWD'], ['M. Amoura', 'FWD'], ['B. Bounedjah', 'FWD'], ['A. Gouiri', 'FWD']],
  AUS: [['M. Ryan', 'GK'], ['H. Souttar', 'DEF'], ['A. Behich', 'DEF'], ['K. Rowles', 'DEF'], ['M. Degenek', 'DEF'], ['A. O’Neill', 'MID'], ['C. Metcalfe', 'MID'], ['R. McGree', 'MID'], ['J. Irvine', 'MID'], ['M. Leckie', 'FWD'], ['C. Goodwin', 'FWD'], ['K. Yengi', 'FWD']],
  ECU: [['H. Galindez', 'GK'], ['P. Hincapie', 'DEF'], ['W. Pacho', 'DEF'], ['P. Estupinan', 'DEF'], ['F. Torres', 'DEF'], ['M. Caicedo', 'MID'], ['A. Franco', 'MID'], ['K. Paez', 'MID'], ['E. Valencia', 'FWD'], ['G. Plata', 'FWD'], ['K. Rodriguez', 'FWD'], ['J. Cifuentes', 'MID']],
  GHA: [['L. Ati-Zigi', 'GK'], ['A. Djiku', 'DEF'], ['M. Salisu', 'DEF'], ['G. Mensah', 'DEF'], ['T. Lamptey', 'DEF'], ['T. Partey', 'MID'], ['M. Kudus', 'MID'], ['E. Owusu', 'MID'], ['M. Ashimeru', 'MID'], ['J. Ayew', 'FWD'], ['I. Williams', 'FWD'], ['A. Semenyo', 'FWD']],
  MAR: [['Y. Bounou', 'GK'], ['A. Hakimi', 'DEF'], ['N. Mazraoui', 'DEF'], ['N. Aguerd', 'DEF'], ['R. Saiss', 'DEF'], ['S. Amrabat', 'MID'], ['A. Ounahi', 'MID'], ['B. Diaz', 'MID'], ['Y. En-Nesyri', 'FWD'], ['H. Ziyech', 'FWD'], ['A. El Kaabi', 'FWD'], ['E. Ezzalzouli', 'FWD']],
  NED: [['B. Verbruggen', 'GK'], ['V. van Dijk', 'DEF'], ['D. Dumfries', 'DEF'], ['N. Ake', 'DEF'], ['M. de Ligt', 'DEF'], ['F. de Jong', 'MID'], ['T. Reijnders', 'MID'], ['R. Gravenberch', 'MID'], ['J. Schouten', 'MID'], ['C. Gakpo', 'FWD'], ['M. Depay', 'FWD'], ['X. Simons', 'FWD']],
  PAN: [['O. Mosquera', 'GK'], ['F. Escobar', 'DEF'], ['M. Murillo', 'DEF'], ['A. Andrade', 'DEF'], ['E. Davis', 'DEF'], ['A. Carrasquilla', 'MID'], ['A. Godoy', 'MID'], ['C. Martinez', 'MID'], ['I. Diaz', 'FWD'], ['J. Fajardo', 'FWD'], ['C. Waterman', 'FWD'], ['E. Rodriguez', 'FWD']],
  ESP: [['U. Simon', 'GK'], ['D. Carvajal', 'DEF'], ['R. Le Normand', 'DEF'], ['M. Cucurella', 'DEF'], ['A. Laporte', 'DEF'], ['Rodri', 'MID'], ['Pedri', 'MID'], ['F. Ruiz', 'MID'], ['M. Merino', 'MID'], ['Lamine Yamal', 'FWD'], ['N. Williams', 'FWD'], ['M. Oyarzabal', 'FWD']],
  URU: [['S. Rochet', 'GK'], ['R. Araujo', 'DEF'], ['J. Gimenez', 'DEF'], ['M. Olivera', 'DEF'], ['N. Nandez', 'DEF'], ['F. Valverde', 'MID'], ['M. Ugarte', 'MID'], ['N. de la Cruz', 'MID'], ['R. Bentancur', 'MID'], ['D. Nunez', 'FWD'], ['F. Pellistri', 'FWD'], ['M. Araujo', 'FWD']],
};

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

const ALIAS_TO_CODE = new Map<string, string>();
for (const [names, code] of ALIASES) {
  for (const name of names) ALIAS_TO_CODE.set(name, code);
}

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i += 1) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const BASE: Record<'GK' | 'DEF' | 'MID' | 'FWD', [number, number]> = {
  GK: [4.5, 3],
  DEF: [4.5, 4],
  MID: [5.0, 6],
  FWD: [5.5, 8],
};

function priceFor(name: string, position: 'GK' | 'DEF' | 'MID' | 'FWD'): number {
  const normal = normalize(name);
  for (const [surname, price] of MARQUEE) {
    if (normal.includes(surname)) return price;
  }
  const [base, steps] = BASE[position];
  return Number((base + (hash(name) % steps) * 0.5).toFixed(1));
}

type ParsedPlayer = {
  code: string;
  name: string;
  title: string | null;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
};

function parseSquads(wikitext: string): ParsedPlayer[] {
  const lines = wikitext.split('\n');
  const players: ParsedPlayer[] = [];
  const seen = new Set<string>();
  let code: string | null = null;

  const headerRe = /^=+\s*(.+?)\s*=+\s*$/;
  const playerRe = /\{\{nat fs (?:g )?player\s*\|(.+?)\}\}/;

  for (const line of lines) {
    const header = headerRe.exec(line.trim());
    if (header) {
      const mapped = ALIAS_TO_CODE.get(normalize(header[1] ?? ''));
      code = mapped ?? code;
      if (/^group [a-l]$/.test(normalize(header[1] ?? ''))) code = null;
      continue;
    }
    if (!code) continue;
    const match = playerRe.exec(line);
    if (!match) continue;
    const params = match[1] ?? '';
    const posMatch = /pos\s*=\s*([A-Za-z]{2})/.exec(params);
    const position = POSITION_MAP[(posMatch?.[1] ?? '').toUpperCase()];
    if (!position) continue;
    const info = extractNameTitle(params);
    if (!info) continue;
    const key = `${code}:${normalize(info.name)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    players.push({ code, name: info.name, title: info.title, position });
  }
  return players;
}

function extractNameTitle(params: string): { name: string; title: string | null } | null {
  const linked = /name\s*=\s*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/.exec(params);
  if (linked) {
    const title = (linked[1] ?? '').trim();
    const name = (linked[2] ?? linked[1] ?? '').trim();
    return name ? { name, title: title || null } : null;
  }
  const plain = /name\s*=\s*([^|}]+)/.exec(params);
  if (plain) {
    const name = plain[1].trim();
    return name ? { name, title: null } : null;
  }
  return null;
}

type PageImagesResponse = {
  query?: {
    normalized?: { from: string; to: string }[];
    redirects?: { from: string; to: string }[];
    pages?: { title?: string; thumbnail?: { source?: string } }[];
  };
};

async function fetchPhotos(titles: string[]): Promise<Map<string, string>> {
  const unique = [...new Set(titles)];
  const photos = new Map<string, string>();
  for (let i = 0; i < unique.length; i += 50) {
    const chunk = unique.slice(i, i + 50);
    const url = `https://en.wikipedia.org/w/api.php?action=query&format=json&formatversion=2&prop=pageimages&piprop=thumbnail&pithumbsize=240&redirects=1&titles=${encodeURIComponent(chunk.join('|'))}`;
    const res = await fetch(url, { headers: { 'user-agent': 'whistle-seed/1.0' } });
    if (!res.ok) continue;
    const data = (await res.json()) as PageImagesResponse;
    const query = data.query ?? {};
    const normalized = new Map((query.normalized ?? []).map((n) => [n.from, n.to]));
    const redirects = new Map((query.redirects ?? []).map((r) => [r.from, r.to]));
    const thumbByTitle = new Map<string, string>();
    for (const page of query.pages ?? []) {
      if (page.title && page.thumbnail?.source) thumbByTitle.set(page.title, page.thumbnail.source);
    }
    for (const title of chunk) {
      const normalizedTitle = normalized.get(title) ?? title;
      const finalTitle = redirects.get(normalizedTitle) ?? normalizedTitle;
      const thumb = thumbByTitle.get(finalTitle);
      if (thumb) photos.set(title, thumb);
    }
  }
  return photos;
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required to seed players');
  }

  const response = await fetch(WIKI_API, { headers: { 'user-agent': 'whistle-seed/1.0' } });
  if (!response.ok) {
    throw new Error(`wikipedia fetch failed: ${response.status}`);
  }
  const body = (await response.json()) as { parse?: { wikitext?: string } };
  const wikitext = body.parse?.wikitext;
  if (!wikitext) {
    throw new Error('wikipedia returned no wikitext');
  }

  const parsed = parseSquads(wikitext);
  const photoByTitle = await fetchPhotos(
    parsed.map((player) => player.title).filter((title): title is string => Boolean(title)),
  );

  const counts = new Map<string, number>();
  const rows = parsed.map((player) => {
    const next = (counts.get(player.code) ?? 0) + 1;
    counts.set(player.code, next);
    return {
      externalId: `${player.code.toLowerCase()}-${next}`,
      name: player.name,
      position: player.position,
      nation: CODE_TO_NATION[player.code] ?? player.code,
      teamCode: player.code,
      priceMillions: priceFor(player.name, player.position),
      photo: (player.title && photoByTitle.get(player.title)) || null,
    };
  });

  let fallbackCount = 0;
  for (const [code, list] of Object.entries(FALLBACK)) {
    if (counts.has(code)) continue;
    list.forEach(([name, position], index) => {
      rows.push({
        externalId: `${code.toLowerCase()}-${index + 1}`,
        name,
        position,
        nation: CODE_TO_NATION[code] ?? code,
        teamCode: code,
        priceMillions: priceFor(name, position),
        photo: null,
      });
      fallbackCount += 1;
    });
    counts.set(code, list.length);
  }

  const prisma = createPrismaClient({ databaseUrl });
  try {
    await prisma.$transaction([
      prisma.leagueEntry.deleteMany({}),
      prisma.fantasyPick.deleteMany({}),
      prisma.fantasyTeam.deleteMany({}),
      prisma.league.deleteMany({}),
      prisma.playerScore.deleteMany({}),
      prisma.player.deleteMany({}),
    ]);
    await prisma.player.createMany({ data: rows });

    const withPhotos = rows.filter((row) => row.photo).length;
    const missing = Object.keys(CODE_TO_NATION).filter((code) => !counts.has(code));
    console.log(
      `seeded ${rows.length} players across ${counts.size} nations (${fallbackCount} fallback, ${withPhotos} with Wikipedia photos)`,
    );
    if (missing.length > 0) {
      console.log(`no players for: ${missing.join(', ')}`);
    }
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((err) => {
  console.error(err);
  process.exit(1);
});
