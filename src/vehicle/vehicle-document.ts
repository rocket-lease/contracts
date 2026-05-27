import { z } from 'zod';

export const VehicleDocumentStatusSchema = z.enum([
  'none',
  'pending',
  'verified',
  'rejected',
]);
export type VehicleDocumentStatus = z.infer<typeof VehicleDocumentStatusSchema>;

const DocumentFileSchema = z.object({
  filename: z.string().trim().min(1),
  mimeType: z.string().trim().min(1),
  data: z.string().trim().min(1),
});
export type DocumentFile = z.infer<typeof DocumentFileSchema>;

export const VehicleDocumentsSchema = z.object({
  title: DocumentFileSchema,
  greenCard: DocumentFileSchema,
});
export type VehicleDocuments = z.infer<typeof VehicleDocumentsSchema>;

export const SubmitVehicleDocumentsRequestSchema = VehicleDocumentsSchema;
export type SubmitVehicleDocumentsRequest = z.infer<
  typeof SubmitVehicleDocumentsRequestSchema
>;

export const VehicleDocumentSummarySchema = z.object({
  status: VehicleDocumentStatusSchema,
  documents: z.object({
    title: z.object({ filename: z.string() }),
    greenCard: z.object({ filename: z.string() }),
  }),
  rejectionReason: z.string().nullable(),
  submittedAt: z.string().datetime().nullable(),
  reviewedAt: z.string().datetime().nullable(),
  verifiedAt: z.string().datetime().nullable(),
});
export type VehicleDocumentSummary = z.infer<
  typeof VehicleDocumentSummarySchema
>;

export const GetVehicleDocumentStatusResponseSchema =
  VehicleDocumentSummarySchema;
export type GetVehicleDocumentStatusResponse = z.infer<
  typeof GetVehicleDocumentStatusResponseSchema
>;

export const SubmitVehicleDocumentsResponseSchema =
  VehicleDocumentSummarySchema;
export type SubmitVehicleDocumentsResponse = z.infer<
  typeof SubmitVehicleDocumentsResponseSchema
>;

export const RequiredDocumentsResponseSchema = z.object({
  requiredDocuments: z.array(z.string()),
});
export type RequiredDocumentsResponse = z.infer<
  typeof RequiredDocumentsResponseSchema
>;

export const ProcessDocumentsResponseSchema = z.object({
  processed: z.number().int().nonnegative(),
});
export type ProcessDocumentsResponse = z.infer<
  typeof ProcessDocumentsResponseSchema
>;
