import type { Agent, AgentSlug } from "@/types";

export const AGENTS: Record<AgentSlug, Agent> = {
  scout: {
    slug: "scout",
    name: "Emma",
    role: "Saves great moments",
    tagline: "Keeps the best bits from every match.",
    personaQuote:
      "That goal at 67 minutes — worth keeping forever.",
    tracks: ["Moments"],
    watches:
      "Goals, red cards, big saves, upsets, and anything people will still be talking about tomorrow.",
    acts:
      "When something big happens, Emma saves it for you to keep.",
    strategy:
      "Only save moments that actually matter. Skip the boring stuff.",
    capitalModel:
      "You set a small spending limit. Emma only uses it to save moments — nothing else.",
    accentClass: "text-zinc-300",
    accentHex: "#9CA3AF",
    glyph: "EMM",
    stats: {
      matchesActedOn: 18,
      totalDecisions: 47,
      totalVolumeUsdt: 0,
      winRatePct: 100,
      pnlUsdt: 0,
      allocatorsCount: 64,
      capitalAssignedUsdt: 412,
      trackRecord: [3, 5, 4, 7, 6, 9, 8, 12, 11, 14, 12, 16, 18, 22, 24, 27, 33, 47],
    },
  },
  bookie: {
    slug: "bookie",
    name: "Jack",
    role: "Places match bets",
    tagline: "Bets on what happens next in the game.",
    personaQuote: "First goal before half time? The odds look wrong — I'm in.",
    tracks: ["Bets"],
    watches:
      "Team news, who's playing, how the game is going, and what usually happens next.",
    acts:
      "Places simple bets during the match — like who scores first or how many corners there will be.",
    strategy:
      "Only bet when the odds look off. Never spend more than the limit you set.",
    capitalModel:
      "You choose how much Jack can spend per match. Jack stays inside that limit.",
    accentClass: "text-amber-300",
    accentHex: "#F59E0B",
    glyph: "JCK",
    stats: {
      matchesActedOn: 16,
      totalDecisions: 312,
      totalVolumeUsdt: 184_220,
      winRatePct: 57.4,
      pnlUsdt: 11_482.5,
      allocatorsCount: 41,
      capitalAssignedUsdt: 92_400,
      trackRecord: [0, 220, 410, 1100, 1780, 2400, 3120, 4220, 4980, 5640, 6800, 7500, 8420, 9320, 9980, 10410, 10960, 11482],
    },
  },
  manager: {
    slug: "manager",
    name: "Tom",
    role: "Picks your players",
    tagline: "Chooses which players to back each match.",
    personaQuote: "Everyone picked the same star — I'm going the other way.",
    tracks: ["Teams"],
    watches: "Who's playing well, who's tired, and who tends to struggle against the other side.",
    acts:
      "Picks 11 players before each match and swaps them when it makes sense.",
    strategy:
      "Three styles: play it safe, go bold, or do the opposite of what most people pick.",
    capitalModel:
      "You pay an entry fee for the tournament. The best results share the prize pool at the end.",
    accentClass: "text-emerald-300",
    accentHex: "#10B981",
    glyph: "TOM",
    stats: {
      matchesActedOn: 17,
      totalDecisions: 51,
      totalVolumeUsdt: 24_600,
      winRatePct: 64.1,
      pnlUsdt: 8_140,
      allocatorsCount: 29,
      capitalAssignedUsdt: 14_500,
      trackRecord: [200, 600, 1100, 1750, 2400, 3010, 3550, 4080, 4620, 5180, 5740, 6210, 6700, 7180, 7560, 7860, 8020, 8140],
    },
  },
};

export const AGENT_LIST = [AGENTS.scout, AGENTS.bookie, AGENTS.manager] as const;

export const AGENT_NAMES = AGENT_LIST.map((agent) => agent.name).join(" · ");
