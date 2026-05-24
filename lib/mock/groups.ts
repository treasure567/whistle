import type { Group } from "@/types";

function standing(
  code: string,
  played: number,
  won: number,
  drawn: number,
  lost: number,
  gf: number,
  ga: number,
) {
  return {
    code,
    played,
    won,
    drawn,
    lost,
    gf,
    ga,
    points: won * 3 + drawn,
  };
}

export const GROUPS: ReadonlyArray<Group> = [
  {
    letter: "A",
    teams: [
      standing("ESP", 2, 2, 0, 0, 5, 1),
      standing("NED", 2, 1, 0, 1, 3, 2),
      standing("URU", 2, 0, 1, 1, 2, 3),
      standing("NZL", 2, 0, 1, 1, 0, 4),
    ],
  },
  {
    letter: "B",
    teams: [
      standing("FRA", 2, 1, 1, 0, 4, 2),
      standing("GER", 2, 1, 1, 0, 3, 2),
      standing("DEN", 2, 0, 1, 1, 1, 2),
      standing("CAN", 2, 0, 1, 1, 1, 3),
    ],
  },
  {
    letter: "C",
    teams: [
      standing("ARG", 2, 2, 0, 0, 5, 2),
      standing("MEX", 2, 1, 0, 1, 3, 3),
      standing("KOR", 2, 1, 0, 1, 2, 2),
      standing("TUN", 2, 0, 0, 2, 1, 4),
    ],
  },
  {
    letter: "D",
    teams: [
      standing("ENG", 2, 1, 1, 0, 4, 1),
      standing("USA", 2, 1, 1, 0, 3, 2),
      standing("IRN", 2, 0, 1, 1, 1, 2),
      standing("WAL", 2, 0, 1, 1, 1, 4),
    ],
  },
  {
    letter: "E",
    teams: [
      standing("ITA", 2, 2, 0, 0, 4, 0),
      standing("CRO", 2, 1, 0, 1, 2, 2),
      standing("SUI", 2, 1, 0, 1, 2, 2),
      standing("CRC", 2, 0, 0, 2, 0, 4),
    ],
  },
  {
    letter: "F",
    teams: [
      standing("BRA", 2, 2, 0, 0, 6, 1),
      standing("POR", 2, 1, 0, 1, 3, 2),
      standing("SEN", 2, 1, 0, 1, 2, 2),
      standing("ECU", 2, 0, 0, 2, 1, 7),
    ],
  },
  {
    letter: "G",
    teams: [
      standing("BEL", 2, 1, 1, 0, 3, 1),
      standing("JPN", 2, 1, 1, 0, 2, 1),
      standing("SRB", 2, 0, 1, 1, 1, 2),
      standing("AUS", 2, 0, 1, 1, 0, 2),
    ],
  },
  {
    letter: "H",
    teams: [
      standing("POR", 2, 2, 0, 0, 4, 1),
      standing("MAR", 2, 1, 0, 1, 2, 2),
      standing("GHA", 2, 1, 0, 1, 2, 2),
      standing("KSA", 2, 0, 0, 2, 1, 4),
    ],
  },
  {
    letter: "I",
    teams: [
      standing("COL", 2, 2, 0, 0, 3, 0),
      standing("CHI", 2, 1, 0, 1, 2, 1),
      standing("EGY", 2, 1, 0, 1, 1, 2),
      standing("QAT", 2, 0, 0, 2, 0, 3),
    ],
  },
  {
    letter: "J",
    teams: [
      standing("NOR", 2, 2, 0, 0, 5, 2),
      standing("SWE", 2, 1, 0, 1, 3, 2),
      standing("AUT", 2, 1, 0, 1, 2, 3),
      standing("PER", 2, 0, 0, 2, 1, 4),
    ],
  },
  {
    letter: "K",
    teams: [
      standing("TUR", 2, 1, 1, 0, 3, 1),
      standing("HUN", 2, 1, 1, 0, 2, 1),
      standing("ALG", 2, 0, 1, 1, 1, 2),
      standing("VEN", 2, 0, 1, 1, 0, 2),
    ],
  },
  {
    letter: "L",
    teams: [
      standing("NGA", 2, 2, 0, 0, 4, 1),
      standing("CIV", 2, 1, 0, 1, 3, 2),
      standing("CMR", 2, 1, 0, 1, 2, 2),
      standing("PAR", 2, 0, 0, 2, 1, 5),
    ],
  },
];

export function groupByCountry(code: string): Group | undefined {
  return GROUPS.find((g) => g.teams.some((t) => t.code === code));
}

export function groupByLetter(letter: string): Group | undefined {
  return GROUPS.find((g) => g.letter === letter);
}
