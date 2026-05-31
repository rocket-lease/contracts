import { z } from 'zod';

export const PushSubscriptionKeysSchema = z.object({
  auth: z.string(),
  p256dh: z.string(),
});

export const RegisterPushSubscriptionRequestSchema = z.object({
  endpoint: z.string().url(),
  expirationTime: z.number().nullable(),
  keys: PushSubscriptionKeysSchema,
});
export type RegisterPushSubscriptionRequest = z.infer<typeof RegisterPushSubscriptionRequestSchema>;

export const UnregisterPushSubscriptionRequestSchema = z.object({
  endpoint: z.string().url(),
});
export type UnregisterPushSubscriptionRequest = z.infer<typeof UnregisterPushSubscriptionRequestSchema>;

export const VapidPublicKeyResponseSchema = z.object({
  publicKey: z.string(),
});
export type VapidPublicKeyResponse = z.infer<typeof VapidPublicKeyResponseSchema>;
