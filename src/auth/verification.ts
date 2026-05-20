import { z } from 'zod';

export const VerificationChannelSchema = z.enum(['email', 'phone']);
export type VerificationChannel = z.infer<typeof VerificationChannelSchema>;

export const SendOtpRequestSchema = z.object({
  channel: VerificationChannelSchema,
});
export type SendOtpRequest = z.infer<typeof SendOtpRequestSchema>;

export const SendOtpResponseSchema = z.object({
  sentAt: z.string().datetime(),
  expiresAt: z.string().datetime(),
});
export type SendOtpResponse = z.infer<typeof SendOtpResponseSchema>;

export const VerifyOtpRequestSchema = z.object({
  channel: VerificationChannelSchema,
  code: z
    .string()
    .regex(/^\d{6}$/, 'Code must be 6 digits'),
});
export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequestSchema>;

export const VerifyOtpReasonSchema = z.enum([
  'incorrect',
  'expired',
  'exhausted',
  'not_found',
]);
export type VerifyOtpReason = z.infer<typeof VerifyOtpReasonSchema>;

export const VerifyOtpResponseSchema = z.discriminatedUnion('verified', [
  z.object({
    verified: z.literal(true),
  }),
  z.object({
    verified: z.literal(false),
    reason: VerifyOtpReasonSchema,
    attemptsLeft: z.number().int().min(0),
  }),
]);
export type VerifyOtpResponse = z.infer<typeof VerifyOtpResponseSchema>;

export const VerificationStatusResponseSchema = z.object({
  email: z.boolean(),
  phone: z.boolean(),
});
export type VerificationStatusResponse = z.infer<
  typeof VerificationStatusResponseSchema
>;
