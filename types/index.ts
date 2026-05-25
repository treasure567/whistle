import type { Address, Hex } from "viem";

export type AgentSlug = "scout" | "bookie" | "manager";

export type AgentTrack = "Moments" | "Bets" | "Teams";

export interface Agent {
  slug: AgentSlug;
  name: string;
  role: string;
  tagline: string;
  personaQuote: string;
  tracks: AgentTrack[];
  watches: string;
  acts: string;
  strategy: string;
  capitalModel: string;
  accentClass: string;
  accentHex: string;
  glyph: string;
  stats: AgentStats;
  onchain?: AgentOnchain;
}

export interface AgentOnchain {
  registryId: number | null;
  ownerAddress: Address;
  strategyHash: Hex;
}

export interface AgentStats {
  matchesActedOn: number;
  totalDecisions: number;
  totalVolumeUsdt: number;
  winRatePct: number;
  pnlUsdt: number;
  allocatorsCount: number;
  capitalAssignedUsdt: number;
  trackRecord: number[];
}

export type ActivityKind =
  | "mint"
  | "position-open"
  | "position-close"
  | "roster-set"
  | "session-key"
  | "settlement";

export interface ActivityItem {
  id: string;
  agent: AgentSlug;
  kind: ActivityKind;
  matchId: string;
  matchLabel: string;
  matchMinute: number | null;
  txHash: Hex;
  blockNumber: number;
  timestamp: number;
  headline: string;
  detail: string;
  amountUsdt?: number;
  outcome?: "won" | "lost" | "pending";
}

export interface Position {
  id: string;
  agent: AgentSlug;
  matchId: string;
  matchLabel: string;
  market: string;
  side: string;
  stakeUsdt: number;
  priceCents: number;
  openedAt: number;
  txHash: Hex;
  status: "open" | "won" | "lost";
  settledPnlUsdt?: number;
}

export interface Mint {
  id: string;
  tokenId: number;
  matchId: string;
  matchLabel: string;
  moment: string;
  minute: number;
  significance: number;
  txHash: Hex;
  mintedAt: number;
  imageGradient: string;
}

export interface RosterSlot {
  position: "GK" | "DEF" | "MID" | "FWD";
  nation: string;
  jersey: number;
  form: number;
}

export interface Roster {
  id: string;
  matchday: number;
  profile: "Aggressive" | "Defensive" | "Contrarian";
  txHash: Hex;
  setAt: number;
  pointsProjected: number;
  pointsActual?: number;
  slots: RosterSlot[];
}

export interface LeaderboardRow {
  rank: number;
  wallet: Address;
  agent: AgentSlug;
  pnlUsdt: number;
  decisions: number;
  winRatePct: number;
  delta24h: number;
}

export type MatchPhase =
  | "scheduled"
  | "kickoff-soon"
  | "first-half"
  | "halftime"
  | "second-half"
  | "extra-time"
  | "fulltime";

export interface MatchInfo {
  id: string;
  home: string;
  homeFlag: string;
  away: string;
  awayFlag: string;
  scoreHome: number;
  scoreAway: number;
  minute: number | null;
  phase: MatchPhase;
  kickoffAt: number;
  group: string;
  venue: string;
}

export type MatchEventType =
  | "goal"
  | "own-goal"
  | "penalty"
  | "yellow-card"
  | "red-card"
  | "substitution";

export interface MatchEvent {
  id: string;
  matchId: string;
  type: MatchEventType;
  minute: number;
  team: "home" | "away";
  nation: string;
  jersey: number;
  detail?: string;
}

export interface LineupPlayer {
  nation: string;
  jersey: number;
  row: "gk" | "df" | "cdm" | "cm" | "cam" | "fw";
}

export interface MatchLineup {
  matchId: string;
  homeFormation: string;
  awayFormation: string;
  home: ReadonlyArray<LineupPlayer>;
  away: ReadonlyArray<LineupPlayer>;
}

export interface SquadPlayer {
  id: number;
  number: number | null;
  position: string | null;
  name: string;
  age: number | null;
  photo: string;
}

export interface Squad {
  code: string;
  country: string;
  teamId: number;
  teamName: string;
  logo: string;
  players: ReadonlyArray<SquadPlayer>;
}

export interface GroupStanding {
  code: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  points: number;
}

export interface Group {
  letter: string;
  teams: ReadonlyArray<GroupStanding>;
}

export interface MatchStats {
  matchId: string;
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
  offsides: { home: number; away: number };
  passes: { home: number; away: number };
  passAccuracy: { home: number; away: number };
}

export interface TopScorer {
  rank: number;
  playerId: number;
  name: string;
  photo: string;
  country: string;
  countryFlag: string;
  goals: number;
  assists: number;
  matches: number;
}

export interface Allocation {
  id: string;
  agent: AgentSlug;
  ceilingUsdt: number;
  perMatchCapUsdt: number;
  remainingUsdt: number;
  sessionExpiresAt: number;
  createdAt: number;
  txHash: Hex;
  status: "active" | "expired" | "revoked";
}
