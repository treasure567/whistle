import type { Agent, AgentSlug } from "@/types";

export const AGENTS: Record<AgentSlug, Agent> = {
  scout: {
    slug: "scout",
    name: "The Scout",
    role: "Moments engine",
    tagline: "Mints the moments that matter. Never the noise.",
    personaQuote:
      "Forty-seven seconds. Brace. A goal worth holding onto.",
    tracks: ["NFT"],
    watches:
      "Live match feed — goals, cards, subs, big chances, upsets, late drama.",
    acts:
      "Mints commemorative ERC-721 attestations to assigned wallets when the cultural-weight threshold is met.",
    strategy:
      "Optimise for cultural weight, not all events. Avoid spam-minting. Significance ≥ 0.72 only.",
    capitalModel:
      "Small OKB for gas per session. Mints are no-cost to users beyond gas.",
    accentClass: "text-zinc-300",
    accentHex: "#9CA3AF",
    glyph: "SCT",
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
    name: "The Bookie",
    role: "Micro-market maker",
    tagline: "Edge or nothing. Settles in one block.",
    personaQuote: "First-goal under 30. The book has it at 2.10. I have it at 1.78.",
    tracks: ["Prediction", "Trading"],
    watches:
      "Pre-match news, lineup announcements, social sentiment, in-match flow.",
    acts:
      "Generates micro-markets (first goal < 30', > 4 corners H1, etc.), prices them, takes positions, settles per match.",
    strategy:
      "Take edge on under-priced micro-events only. Decline if implied edge < 4%. Bankroll Kelly-fractioned at 0.25×.",
    capitalModel:
      "User assigns USDT. Bookie deploys via session key with per-match ceiling.",
    accentClass: "text-amber-300",
    accentHex: "#F59E0B",
    glyph: "BKE",
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
    name: "The Manager",
    role: "Fantasy coach",
    tagline: "Drafts the eleven. Defends the choice in one line.",
    personaQuote: "ARG 10 stays on the bench. Form is for the prosecution, not the defence.",
    tracks: ["Fantasy", "GameFi"],
    watches: "Lineup form, opposition strength, fatigue, injury news.",
    acts:
      "Drafts an 11-position roster, makes transfers per matchday. Three profiles: Aggressive, Defensive, Contrarian.",
    strategy:
      "Aggressive runs 3-4-3 in open groups. Defensive parks the bus when opp xG > 2.1. Contrarian inverts the consensus by ≥ 35%.",
    capitalModel:
      "Tournament entry fee in USDT. Prize pool paid to top Managers at the final.",
    accentClass: "text-emerald-300",
    accentHex: "#10B981",
    glyph: "MGR",
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
