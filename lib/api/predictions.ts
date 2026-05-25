import { apiGet, apiPost } from "./client";
import {
  predictionSchema,
  predictionsSchema,
  type PredictionRecord,
} from "./schemas";

export type CreatePredictionInput = {
  ownerAddress: string;
  matchExternalId: string;
  market: string;
  side: string;
  stakeUsdt: string;
};

export function createPrediction(input: CreatePredictionInput): Promise<PredictionRecord> {
  return apiPost("/predictions", input, predictionSchema);
}

export async function fetchPredictions(user: string): Promise<PredictionRecord[]> {
  try {
    return await apiGet(`/predictions?user=${user}`, predictionsSchema);
  } catch {
    return [];
  }
}
