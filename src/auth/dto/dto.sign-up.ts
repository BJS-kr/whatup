import { z } from 'zod';

export const signUpSchema = z.object({
  email: z.string().email(),
  nickname: z.string().min(2).max(10),
  password: z.string().min(8).max(20),
});

export type SignUpDto = z.infer<typeof signUpSchema>;
