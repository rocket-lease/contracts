import { z } from 'zod';

export const VerificationStatusSchema = z.enum(['unverified', 'pending', 'verified']);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const UserLevelSchema = z.enum(['bronze', 'silver', 'gold', 'platinum']);
export type UserLevel = z.infer<typeof UserLevelSchema>;

export const VehiclePreferencesSchema = z.object({
  transmission: z.enum(['automatic', 'manual']).nullable(),
  accessibility: z.array(z.string().trim().min(1)).max(10),
  maxPriceDaily: z.number().int().positive().nullable(),
});
export type VehiclePreferences = z.infer<typeof VehiclePreferencesSchema>;

export const UserPublicSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});
export type UserPublicSummary = z.infer<typeof UserPublicSummarySchema>;

export const GetMyProfileResponseSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(100),
  email: z.string().email(),
  phone: z.string().trim().min(1).max(20),
  avatarUrl: z.string().url().nullable(),
  verificationStatus: VerificationStatusSchema,
  level: UserLevelSchema,
  reputationScore: z.number().min(0).max(5),
  preferences: VehiclePreferencesSchema,
});
export type GetMyProfileResponse = z.infer<typeof GetMyProfileResponseSchema>;
export const GetUserProfileResponseSchema = GetMyProfileResponseSchema;
export type GetUserProfileResponse = z.infer<typeof GetUserProfileResponseSchema>;

export const UpdateMyProfileRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(20),
  avatarUrl: z.string().url().nullable(),
  preferences: VehiclePreferencesSchema,
});
export type UpdateMyProfileRequest = z.infer<typeof UpdateMyProfileRequestSchema>;

export const UpdateMyProfileResponseSchema = GetMyProfileResponseSchema;
export type UpdateMyProfileResponse = z.infer<typeof UpdateMyProfileResponseSchema>;
