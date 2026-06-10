import { z } from 'zod';

export const ReputationBadgeSchema = z.enum(['conductor_destacado']);
export type ReputationBadge = z.infer<typeof ReputationBadgeSchema>;

export const GetReputationResponseSchema = z.object({
  userId: z.string().uuid(),
  score: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  badges: z.array(ReputationBadgeSchema),
  isLowReputation: z.boolean(),
  penaltyCount: z.number().int().nonnegative(),
});
export type GetReputationResponse = z.infer<typeof GetReputationResponseSchema>;
