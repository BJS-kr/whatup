import { z } from 'zod';

export const createThreadSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  maxLength: z.number().int().positive(),
  autoAccept: z.boolean().default(false),
  initialContent: z.string().min(1),
});

export type CreateThreadDto = z.infer<typeof createThreadSchema>;
