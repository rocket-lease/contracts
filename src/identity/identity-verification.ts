import { z } from 'zod';
import {
  VerificationDocumentSchema,
  VerificationStatusSchema,
  VerificationSummarySchema,
  type VerificationDocument,
  type VerificationStatus,
  type VerificationSummary,
} from '../verification/verification';

export const IdentityVerificationStatusSchema = VerificationStatusSchema;
export type IdentityVerificationStatus = VerificationStatus;

export const IdentityVerificationDocumentSchema = VerificationDocumentSchema;
export type IdentityVerificationDocument = VerificationDocument;

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
  ...VerificationSummarySchema.shape,
});
export type IdentityVerificationSummary = VerificationSummary;

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