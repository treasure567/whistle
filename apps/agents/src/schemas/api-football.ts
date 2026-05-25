import { z } from 'zod';

const teamSchema = z.object({
  name: z.string(),
  code: z.string().nullish(),
});

export const fixtureItemSchema = z
  .object({
    fixture: z.object({
      id: z.number(),
      date: z.string(),
      status: z.object({ short: z.string() }),
    }),
    teams: z.object({ home: teamSchema, away: teamSchema }),
  })
  .passthrough();

export const fixturesResponseSchema = z.object({
  response: z.array(fixtureItemSchema),
});

export const eventItemSchema = z
  .object({
    time: z.object({ elapsed: z.number().nullable() }),
    team: z.object({ name: z.string() }).nullish(),
    type: z.string(),
    detail: z.string().nullish(),
  })
  .passthrough();

export const eventsResponseSchema = z.object({
  response: z.array(eventItemSchema),
});

export type FixtureItem = z.infer<typeof fixtureItemSchema>;
export type EventItem = z.infer<typeof eventItemSchema>;
