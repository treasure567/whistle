import { apiGet } from "./client";
import {
  playerRecordsSchema,
  type PlayerPositionValue,
  type PlayerRecord,
} from "./schemas";

export async function fetchPlayers(position?: PlayerPositionValue): Promise<PlayerRecord[]> {
  const query = position ? `?position=${position}` : "";
  try {
    return await apiGet(`/players${query}`, playerRecordsSchema);
  } catch {
    return [];
  }
}
