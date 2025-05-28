import { z } from 'zod';

export const updateThreadSchema = z.object({
  description: z.string().min(1),
  maxLength: z.number().int().positive(),
  autoAccept: z.boolean(),
  allowConsecutiveContribution: z.boolean(),
});

export type UpdateThreadDto = z.infer<typeof updateThreadSchema>;
