import { apiPost } from "./client";
import { managerBriefSchema, type ManagerBriefResult } from "./schemas";

export type BriefPlayer = { name: string; position: string; price: number };

export type ManagerBriefInput = {
  countryName: string;
  opponentName: string;
  formation: string;
  ourStrength: number;
  theirStrength: number;
  xi: BriefPlayer[];
  bench: BriefPlayer[];
  played?: { ourScore: number; theirScore: number };
};

export function fetchManagerBrief(input: ManagerBriefInput): Promise<ManagerBriefResult> {
  return apiPost("/manager/brief", input, managerBriefSchema);
}
