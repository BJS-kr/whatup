import { z } from 'zod';

export const addContentSchema = z.object({
  content: z.string().min(1),
  parentContentId: z.string().optional(),
});

export type AddContentDto = z.infer<typeof addContentSchema>;
