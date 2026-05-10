import { z } from 'zod';
import { ErrorCodes } from './error-codes';

export const ProblemDetailsSchema = z.object({
  type: z.string().url(),
  title: z.string(),
  status: z.number().int(),
  code: z.enum(Object.values(ErrorCodes) as [string, ...string[]]),
  detail: z.string(),
  instance: z.string().optional(),
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;
