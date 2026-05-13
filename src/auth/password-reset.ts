import { z } from 'zod';

export const ForgotPasswordRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
});
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ForgotPasswordResponseSchema = z.object({
  message: z.string(),
});
export type ForgotPasswordResponse = z.infer<typeof ForgotPasswordResponseSchema>;

export const ResetPasswordRequestSchema = z.object({
  accessToken: z.string().min(1, 'accessToken is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

export const ResetPasswordResponseSchema = z.object({
  message: z.string(),
});
export type ResetPasswordResponse = z.infer<typeof ResetPasswordResponseSchema>;
