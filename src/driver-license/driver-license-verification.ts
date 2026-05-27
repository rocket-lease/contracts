import { z } from 'zod';
import {
  VerificationDocumentSchema,
  VerificationStatusSchema,
  VerificationSummarySchema,
  type VerificationDocument,
  type VerificationStatus,
  type VerificationSummary,
} from '../verification/verification';

export const DriverLicenseVerificationStatusSchema = VerificationStatusSchema;
export type DriverLicenseVerificationStatus = VerificationStatus;

export const DriverLicenseVerificationDocumentSchema = VerificationDocumentSchema;
export type DriverLicenseVerificationDocument = VerificationDocument;

export const DriverLicenseVerificationDocumentsSchema = z.object({
  frontLicense: DriverLicenseVerificationDocumentSchema,
  selfie: DriverLicenseVerificationDocumentSchema,
});
export type DriverLicenseVerificationDocuments = z.infer<
  typeof DriverLicenseVerificationDocumentsSchema
>;

export const SubmitDriverLicenseVerificationRequestSchema =
  DriverLicenseVerificationDocumentsSchema;
export type SubmitDriverLicenseVerificationRequest = z.infer<
  typeof SubmitDriverLicenseVerificationRequestSchema
>;

export const DriverLicenseVerificationSummarySchema = VerificationSummarySchema;
export type DriverLicenseVerificationSummary = VerificationSummary;

export const SubmitDriverLicenseVerificationResponseSchema =
  DriverLicenseVerificationSummarySchema;
export type SubmitDriverLicenseVerificationResponse = z.infer<
  typeof SubmitDriverLicenseVerificationResponseSchema
>;

export const GetMyDriverLicenseVerificationResponseSchema =
  DriverLicenseVerificationSummarySchema;
export type GetMyDriverLicenseVerificationResponse = z.infer<
  typeof GetMyDriverLicenseVerificationResponseSchema
>;