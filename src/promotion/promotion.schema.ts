import { z } from 'zod';

// ─── Durations ───────────────────────────────────────────────────────────────

export const PromotionDurationSchema = z.object({
  days: z.number().int().positive(),
  valueInCents: z.number().int().nonnegative(),
});

export const PromotionDurationsResponseSchema = z.array(PromotionDurationSchema);
export type PromotionDurationsResponse = z.infer<typeof PromotionDurationsResponseSchema>;

// ─── Promote vehicle request ──────────────────────────────────────────────────

export const PromoteVehicleRequestSchema = z.object({
  durationDays: z.number().int().positive(),
  paymentMethod: z.enum(['bank_transfer', 'card', 'balance']),
});
export type PromoteVehicleRequest = z.infer<typeof PromoteVehicleRequestSchema>;

// ─── Promote vehicle response ─────────────────────────────────────────────────

export const PromoteVehicleResponseSchema = z.object({
  vehicleId: z.string(),
  totalCents: z.number().int().nonnegative(),
  startDate: z.string().datetime(),
  status: z.enum(['active', 'pending_approval']),
  // active
  paidAt: z.string().datetime().optional(),
  transactionId: z.string().optional(),
  // pending_approval (bank transfer)
  transferCode: z.string().optional(),
  transferAlias: z.string().optional(),
  transferExpiresAt: z.string().datetime().optional(),
});
export type PromoteVehicleResponse = z.infer<typeof PromoteVehicleResponseSchema>;

// ─── Get promotion response ───────────────────────────────────────────────────

const ActivePromotionSchema = z.object({
  status: z.enum(['active', 'pending_approval']),
  startDate: z.string().datetime(),
  endsAt: z.string().datetime(),
  durationDays: z.number().int().positive(),
  totalCents: z.number().int().nonnegative(),
  paidAt: z.string().datetime().optional(),
  transactionId: z.string().optional(),
  transferCode: z.string().optional(),
  transferAlias: z.string().optional(),
  transferExpiresAt: z.string().datetime().optional(),
});

export const GetPromotionResponseSchema = z.object({
  active: z.boolean(),
  promotion: ActivePromotionSchema.nullable(),
});
export type GetPromotionResponse = z.infer<typeof GetPromotionResponseSchema>;
