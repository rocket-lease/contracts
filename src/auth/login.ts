import { z } from 'zod';

export const LoginUserRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
export type LoginUserRequest = z.infer<typeof LoginUserRequestSchema>;

export const LoginUserResponseSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string(),
  expires_in: z.number(),
});
export type LoginUserResponse = z.infer<typeof LoginUserResponseSchema>;
