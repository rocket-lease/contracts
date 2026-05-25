import { z } from 'zod';

export const IdentityVerificationStatusSchema = z.enum([
  'not_started',
  'pending',
  'verified',
  'rejected',
]);
export type IdentityVerificationStatus = z.infer<
  typeof IdentityVerificationStatusSchema
>;

export const IdentityVerificationDocumentSchema = z.object({
  fileName: z.string().trim().min(1),
  mimeType: z.string().trim().min(1),
  dataUrl: z.string().trim().min(1),
});
export type IdentityVerificationDocument = z.infer<
  typeof IdentityVerificationDocumentSchema
>;

export const IdentityVerificationDocumentsSchema = z.object({
  frontDni: IdentityVerificationDocumentSchema,
  backDni: IdentityVerificationDocumentSchema,
  selfie: IdentityVerificationDocumentSchema,
});
export type IdentityVerificationDocuments = z.infer<
  typeof IdentityVerificationDocumentsSchema
>;

export const SubmitIdentityVerificationRequestSchema =
  IdentityVerificationDocumentsSchema;
export type SubmitIdentityVerificationRequest = z.infer<
  typeof SubmitIdentityVerificationRequestSchema
>;

export const IdentityVerificationSummarySchema = z.object({
  status: IdentityVerificationStatusSchema,
  providerName: z.string().trim().min(1).nullable(),
  providerRequestId: z.string().trim().min(1).nullable(),
  rejectionReason: z.string().trim().min(1).max(280).nullable(),
  submittedAt: z.string().datetime().nullable(),
  reviewAfterAt: z.string().datetime().nullable(),
  reviewedAt: z.string().datetime().nullable(),
  verifiedAt: z.string().datetime().nullable(),
});
export type IdentityVerificationSummary = z.infer<
  typeof IdentityVerificationSummarySchema
>;

export const SubmitIdentityVerificationResponseSchema =
  IdentityVerificationSummarySchema;
export type SubmitIdentityVerificationResponse = z.infer<
  typeof SubmitIdentityVerificationResponseSchema
>;

export const GetMyIdentityVerificationResponseSchema =
  IdentityVerificationSummarySchema;
export type GetMyIdentityVerificationResponse = z.infer<
  typeof GetMyIdentityVerificationResponseSchema
>;