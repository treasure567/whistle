export type WcTeam = {
  code: string;
  name: string;
  group: string;
  rank: number;
};

export const WC_TEAMS: Record<string, WcTeam> = {
  MEX: { code: "MEX", name: "Mexico", group: "A", rank: 15 },
  CZE: { code: "CZE", name: "Czechia", group: "A", rank: 41 },
  RSA: { code: "RSA", name: "South Africa", group: "A", rank: 60 },
  KOR: { code: "KOR", name: "Korea Republic", group: "A", rank: 25 },
  CAN: { code: "CAN", name: "Canada", group: "B", rank: 30 },
  BIH: { code: "BIH", name: "Bosnia & Herzegovina", group: "B", rank: 65 },
  QAT: { code: "QAT", name: "Qatar", group: "B", rank: 55 },
  SUI: { code: "SUI", name: "Switzerland", group: "B", rank: 19 },
  BRA: { code: "BRA", name: "Brazil", group: "C", rank: 6 },
  HAI: { code: "HAI", name: "Haiti", group: "C", rank: 83 },
  MAR: { code: "MAR", name: "Morocco", group: "C", rank: 8 },
  SCO: { code: "SCO", name: "Scotland", group: "C", rank: 43 },
  USA: { code: "USA", name: "USA", group: "D", rank: 16 },
  AUS: { code: "AUS", name: "Australia", group: "D", rank: 27 },
  PAR: { code: "PAR", name: "Paraguay", group: "D", rank: 40 },
  TUR: { code: "TUR", name: "Turkiye", group: "D", rank: 22 },
  CIV: { code: "CIV", name: "Cote d'Ivoire", group: "E", rank: 34 },
  CUW: { code: "CUW", name: "Curacao", group: "E", rank: 82 },
  ECU: { code: "ECU", name: "Ecuador", group: "E", rank: 23 },
  GER: { code: "GER", name: "Germany", group: "E", rank: 10 },
  JPN: { code: "JPN", name: "Japan", group: "F", rank: 18 },
  NED: { code: "NED", name: "Netherlands", group: "F", rank: 7 },
  SWE: { code: "SWE", name: "Sweden", group: "F", rank: 38 },
  TUN: { code: "TUN", name: "Tunisia", group: "F", rank: 44 },
  BEL: { code: "BEL", name: "Belgium", group: "G", rank: 9 },
  EGY: { code: "EGY", name: "Egypt", group: "G", rank: 29 },
  IRN: { code: "IRN", name: "IR Iran", group: "G", rank: 21 },
  NZL: { code: "NZL", name: "New Zealand", group: "G", rank: 85 },
  CPV: { code: "CPV", name: "Cabo Verde", group: "H", rank: 69 },
  KSA: { code: "KSA", name: "Saudi Arabia", group: "H", rank: 61 },
  ESP: { code: "ESP", name: "Spain", group: "H", rank: 2 },
  URU: { code: "URU", name: "Uruguay", group: "H", rank: 17 },
  FRA: { code: "FRA", name: "France", group: "I", rank: 1 },
  IRQ: { code: "IRQ", name: "Iraq", group: "I", rank: 57 },
  NOR: { code: "NOR", name: "Norway", group: "I", rank: 31 },
  SEN: { code: "SEN", name: "Senegal", group: "I", rank: 14 },
  ALG: { code: "ALG", name: "Algeria", group: "J", rank: 28 },
  ARG: { code: "ARG", name: "Argentina", group: "J", rank: 3 },
  AUT: { code: "AUT", name: "Austria", group: "J", rank: 24 },
  JOR: { code: "JOR", name: "Jordan", group: "J", rank: 63 },
  COL: { code: "COL", name: "Colombia", group: "K", rank: 13 },
  COD: { code: "COD", name: "Congo DR", group: "K", rank: 46 },
  POR: { code: "POR", name: "Portugal", group: "K", rank: 5 },
  UZB: { code: "UZB", name: "Uzbekistan", group: "K", rank: 50 },
  CRO: { code: "CRO", name: "Croatia", group: "L", rank: 11 },
  ENG: { code: "ENG", name: "England", group: "L", rank: 4 },
  GHA: { code: "GHA", name: "Ghana", group: "L", rank: 74 },
  PAN: { code: "PAN", name: "Panama", group: "L", rank: 33 },
};

export const WC_GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"] as const;

export function teamName(code: string): string {
  return WC_TEAMS[code]?.name ?? code;
}

export function teamsInGroup(group: string): WcTeam[] {
  return Object.values(WC_TEAMS)
    .filter((team) => team.group === group)
    .sort((a, b) => a.rank - b.rank);
}
