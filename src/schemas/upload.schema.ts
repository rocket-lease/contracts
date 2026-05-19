import { z } from 'zod';

export const UploadSignRequestSchema = z.object({
  resourceType: z.enum(['image', 'video']).optional(),
  folder: z.string().optional(),
});
export type UploadSignRequest = z.infer<typeof UploadSignRequestSchema>;

export const UploadSignResponseSchema = z.object({
  uploadUrl: z.string().url(),
  fields: z.record(z.string()),
});
export type UploadSignResponse = z.infer<typeof UploadSignResponseSchema>;
