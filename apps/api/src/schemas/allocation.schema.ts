import { z } from 'zod';

export const createAllocationBody = z.object({
  kind: z.enum(['SCOUT', 'BOOKIE', 'MANAGER']),
  userAddress: z.string().min(1),
  amount: z.string().regex(/^\d+$/, 'amount must be an integer string'),
  asset: z.string().default('USDT'),
});

export const allocationsQuery = z.object({
  user: z.string().min(1),
});
