export const ErrorCode = {
  INTERNAL: 'INTERNAL',
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  VALIDATION: 'VALIDATION',
  CHAIN_ERROR: 'CHAIN_ERROR',
  AGENT_ERROR: 'AGENT_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export const AgentKind = {
  SCOUT: 'SCOUT',
  BOOKIE: 'BOOKIE',
  MANAGER: 'MANAGER',
} as const;

export type AgentKind = (typeof AgentKind)[keyof typeof AgentKind];

export type Address = `0x${string}`;
export type Hex = `0x${string}`;

export type ApiError = {
  ok: false;
  code: ErrorCode;
  message: string;
  requestId?: string;
};

export type ApiSuccess<T> = {
  ok: true;
  data: T;
  requestId?: string;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export const LiveEventKind = {
  KICKOFF: 'kickoff',
  GOAL: 'goal',
  CARD: 'card',
  SUBSTITUTION: 'substitution',
  VAR: 'var',
  FULLTIME: 'fulltime',
  STATUS: 'status',
} as const;

export type LiveEventKind = (typeof LiveEventKind)[keyof typeof LiveEventKind];

export const LIVE_FEED_CHANNEL = 'whistle.live';

export type LiveEvent = {
  matchExternalId: string;
  kind: LiveEventKind;
  minute: number | null;
  team: string | null;
  detail: string | null;
  occurredAt: string;
};

export const AGENT_FEED_CHANNEL = 'whistle.agent';

export type AgentActivityStatus = 'pending' | 'submitted' | 'confirmed' | 'failed';

export type AgentActivityEvent = {
  agent: AgentKind;
  matchExternalId: string | null;
  action: string;
  summary: string;
  status: AgentActivityStatus;
  txHash: string | null;
  occurredAt: string;
};
