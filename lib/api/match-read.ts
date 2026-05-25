import { apiPost } from "./client";
import {
  matchChatReplySchema,
  matchReadSchema,
  type MatchChatReply,
  type MatchReadResult,
} from "./schemas";

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function fetchMatchRead(home: string, away: string): Promise<MatchReadResult> {
  return apiPost("/matches/read", { home, away }, matchReadSchema);
}

export function sendMatchChat(
  home: string,
  away: string,
  messages: ChatMessage[],
): Promise<MatchChatReply> {
  return apiPost("/matches/chat", { home, away, messages }, matchChatReplySchema);
}
