import { z } from 'zod';
import { UserLevelSchema } from '../profile/profile';

export const BenefitInfoSchema = z.object({
  type: z.string(),
  description: z.string(),
  config: z.record(z.unknown()).nullable(),
});
export type BenefitInfo = z.infer<typeof BenefitInfoSchema>;

export const LevelUpInfoSchema = z.object({
  oldLevel: UserLevelSchema,
  newLevel: UserLevelSchema,
  benefits: z.array(BenefitInfoSchema),
});
export type LevelUpInfo = z.infer<typeof LevelUpInfoSchema>;

export const ReservationRefSchema = z.object({
  id: z.string().uuid(),
  vehicleName: z.string(),
  vehicleId: z.string().uuid(),
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});
export type ReservationRef = z.infer<typeof ReservationRefSchema>;

export const ExperienceTransactionSchema = z.object({
  id: z.string().uuid(),
  amount: z.number().int().nonnegative(),
  status: z.enum(['pending', 'claimed']),
  createdAt: z.string().datetime(),
  reservation: ReservationRefSchema,
});
export type ExperienceTransaction = z.infer<typeof ExperienceTransactionSchema>;

export const LoyaltyProfileSchema = z.object({
  conductorId: z.string().uuid(),
  level: UserLevelSchema,
  totalXp: z.number().int().nonnegative(),
  pendingXp: z.number().int().nonnegative(),
  xpForNextLevel: z.number().int().nonnegative().nullable(),
  progress: z.number().min(0).max(100).nullable(),
  benefits: z.array(BenefitInfoSchema),
});
export type LoyaltyProfile = z.infer<typeof LoyaltyProfileSchema>;
