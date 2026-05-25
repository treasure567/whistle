import { apiGet } from "./client";
import { matchRecordsSchema } from "./schemas";

export type Fixture = {
  id: string;
  matchNumber: number | null;
  homeCode: string;
  awayCode: string;
  group: string | null;
  stage: string | null;
  venue: string | null;
  city: string | null;
  kickoffAt: number;
};

export type FixtureFeed = {
  fixtures: Fixture[];
  source: "live" | "sample";
};

export async function fetchFixtures(): Promise<FixtureFeed> {
  try {
    const records = await apiGet("/matches", matchRecordsSchema);
    const wc = records.filter((record) => record.externalId.startsWith("wc-"));
    if (wc.length === 0) {
      return { fixtures: [], source: "sample" };
    }
    const fixtures = wc
      .map((record) => ({
        id: record.externalId,
        matchNumber: record.payload?.matchNumber ?? null,
        homeCode: record.homeCode,
        awayCode: record.awayCode,
        group: record.payload?.group ?? null,
        stage: record.payload?.stage ?? null,
        venue: record.payload?.venue ?? null,
        city: record.payload?.city ?? null,
        kickoffAt: Date.parse(record.kickoffAt),
      }))
      .sort((a, b) => (a.matchNumber ?? 0) - (b.matchNumber ?? 0));
    return { fixtures, source: "live" };
  } catch {
    return { fixtures: [], source: "sample" };
  }
}
