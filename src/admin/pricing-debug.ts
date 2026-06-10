import { z } from 'zod';

export const EmitDebugSignalsRequestSchema = z
  .object({
    h3Cell: z.string().min(1).optional(),
    locationCode: z.string().min(1).optional(),
    signal: z.enum(['search', 'vehicleView']).default('search'),
    count: z.number().int().min(1).max(500),
    mode: z.enum(['add', 'remove']).default('add'),
  })
  .refine((value) => Boolean(value.h3Cell) !== Boolean(value.locationCode), {
    message: 'Provide exactly one of h3Cell or locationCode',
  });
export type EmitDebugSignalsRequest = z.infer<
  typeof EmitDebugSignalsRequestSchema
>;

export const EmitDebugSignalsResponseSchema = z.object({
  mode: z.enum(['add', 'remove']),
  affected: z.number().int().nonnegative(),
  targetCells: z.array(z.string()),
  message: z.string(),
});
export type EmitDebugSignalsResponse = z.infer<
  typeof EmitDebugSignalsResponseSchema
>;

export const ClearDebugDataResponseSchema = z.object({
  deletedSignals: z.number().int().nonnegative(),
  deletedQuotes: z.number().int().nonnegative(),
});
export type ClearDebugDataResponse = z.infer<
  typeof ClearDebugDataResponseSchema
>;
