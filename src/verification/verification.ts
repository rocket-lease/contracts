import { z } from 'zod';

export const VerificationStatusSchema = z.enum([
  'not_started',
  'pending',
  'verified',
  'rejected',
]);
export type VerificationStatus = z.infer<typeof VerificationStatusSchema>;

export const VerificationDocumentSchema = z.object({
  fileName: z.string().trim().min(1),
  mimeType: z.string().trim().min(1),
  dataUrl: z.string().trim().min(1),
});
export type VerificationDocument = z.infer<typeof VerificationDocumentSchema>;

export const VerificationSummarySchema = z.object({
  status: VerificationStatusSchema,
  providerName: z.string().trim().min(1).nullable(),
  providerRequestId: z.string().trim().min(1).nullable(),
  rejectionReason: z.string().trim().min(1).max(280).nullable(),
  submittedAt: z.string().datetime().nullable(),
  reviewAfterAt: z.string().datetime().nullable(),
  reviewedAt: z.string().datetime().nullable(),
  verifiedAt: z.string().datetime().nullable(),
});
export type VerificationSummary = z.infer<typeof VerificationSummarySchema>;