import { z } from 'zod';

export const matchListQuery = z.object({
  limit: z.coerce.number().int().positive().max(300).default(150),
});
