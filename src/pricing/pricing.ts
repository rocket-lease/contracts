import { z } from 'zod';

export const PricingDiscountTierSchema = z.object({
  minimumDays: z.number().int().positive(),
  discountPercentage: z.number().int().min(1).max(50),
});
export type PricingDiscountTier = z.infer<typeof PricingDiscountTierSchema>;

export const PricingDiscountTiersSchema = z.array(PricingDiscountTierSchema).superRefine((tiers, ctx) => {
  for (let index = 1; index < tiers.length; index += 1) {
    const previous = tiers[index - 1];
    const current = tiers[index];

    if (current!.minimumDays <= previous!.minimumDays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: [index, 'minimumDays'],
        message: 'Discount tiers must be ordered by ascending minimumDays with unique values',
      });
    }
  }
});
export type PricingDiscountTiers = z.infer<typeof PricingDiscountTiersSchema>;

export const PricingQuoteRequestSchema = z.object({
  vehicleId: z.string().uuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  withHomeDelivery: z.boolean().optional(),
  withHomeReturn: z.boolean().optional(),
}).refine((data) => new Date(data.endAt).getTime() > new Date(data.startAt).getTime(), {
  message: 'endAt must be after startAt',
  path: ['endAt'],
});
export type PricingQuoteRequest = z.infer<typeof PricingQuoteRequestSchema>;

export const PricingQuoteSchema = z.object({
  vehicleId: z.string().uuid(),
  currency: z.literal('ARS'),
  basePriceCents: z.number().int().positive(),
  durationDays: z.number().int().positive(),
  subtotalCents: z.number().int().nonnegative(),
  appliedDiscountTier: PricingDiscountTierSchema.nullable(),
  appliedDiscountPercentage: z.number().int().min(0).max(50),
  discountCents: z.number().int().nonnegative(),
  totalCents: z.number().int().nonnegative(),
  multiplier: z.number().min(0.7).max(2.0).optional(),
  deliveryFeeCents: z.number().int().nonnegative().optional(),
  quoteToken: z.string().uuid().optional(),
  expiresAt: z.string().datetime().optional(),
  levelDiscountPercentage: z.number().int().min(0).max(50).optional(),
});
export type PricingQuote = z.infer<typeof PricingQuoteSchema>;

export const PricingQuoteResponseSchema = PricingQuoteSchema;
export type PricingQuoteResponse = z.infer<typeof PricingQuoteResponseSchema>;