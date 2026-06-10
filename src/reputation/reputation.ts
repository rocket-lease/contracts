import { z } from 'zod';

export const ReputationBadgeSchema = z.enum(['conductor_destacado']);
export type ReputationBadge = z.infer<typeof ReputationBadgeSchema>;

export const ReputationRoleSchema = z.object({
  score: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  badges: z.array(ReputationBadgeSchema),
  isLowReputation: z.boolean(),
  penaltyCount: z.number().int().nonnegative(),
});
export type ReputationRole = z.infer<typeof ReputationRoleSchema>;

export const GetReputationResponseSchema = z.object({
  userId: z.string().uuid(),
  asDriver: ReputationRoleSchema,
  asRenter: ReputationRoleSchema,
});
export type GetReputationResponse = z.infer<typeof GetReputationResponseSchema>;
