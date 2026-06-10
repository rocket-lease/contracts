import { z } from 'zod';
import {
  IdentityVerificationStatusSchema,
  IdentityVerificationSummarySchema,
} from '../identity/identity-verification';
import { DriverLicenseVerificationSummarySchema } from '../driver-license/driver-license-verification';
import { ReputationBadgeSchema } from '../reputation/reputation';

export const ProfileVerificationStatusSchema = IdentityVerificationStatusSchema;
export type ProfileVerificationStatus = z.infer<typeof ProfileVerificationStatusSchema>;

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
  verificationStatus: ProfileVerificationStatusSchema,
  identityVerification: IdentityVerificationSummarySchema,
  driverLicenseVerification: DriverLicenseVerificationSummarySchema,
  level: UserLevelSchema,
  balanceInCents: z.number().int().nonnegative(),
  preferences: VehiclePreferencesSchema,
  autoAccept: z.boolean(),
});
export type GetMyProfileResponse = z.infer<typeof GetMyProfileResponseSchema>;
export const GetUserProfileResponseSchema = GetMyProfileResponseSchema;
export type GetUserProfileResponse = z.infer<typeof GetUserProfileResponseSchema>;

export const UpdateMyProfileRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(1).max(20),
  avatarUrl: z.string().url().nullable(),
  preferences: VehiclePreferencesSchema,
  autoAccept: z.boolean().optional(),
});
export type UpdateMyProfileRequest = z.infer<typeof UpdateMyProfileRequestSchema>;

export const UpdateMyProfileResponseSchema = GetMyProfileResponseSchema;
export type UpdateMyProfileResponse = z.infer<typeof UpdateMyProfileResponseSchema>;
