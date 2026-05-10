import { z } from 'zod';

export const RegisterUserRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Invalid email format'),
  dni: z.string()
    .transform((v) => v.replace(/\./g, ''))
    .pipe(z.string().regex(/^\d{7,8}$/, 'DNI must contain 7 or 8 digits')),
  phone: z.string().min(1, 'Phone is required').max(20),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
export type RegisterUserRequest = z.infer<typeof RegisterUserRequestSchema>;

export const RegisterUserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});
export type RegisterUserResponse = z.infer<typeof RegisterUserResponseSchema>;
