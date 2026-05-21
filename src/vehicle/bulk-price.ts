import { z } from 'zod';

export const BulkPriceOperationSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('SET'), valueCents: z.number().int().positive() }),
  z.object({
    type: z.literal('PERCENTAGE'),
    delta: z.number().int().min(-90).max(1000),
  }),
]);

export type BulkPriceOperation = z.infer<typeof BulkPriceOperationSchema>;

export const BulkPriceUpdateRequestSchema = z.object({
  vehicleIds: z.array(z.string().uuid()).min(1).max(100),
  operation: BulkPriceOperationSchema,
});

export type BulkPriceUpdateRequest = z.infer<typeof BulkPriceUpdateRequestSchema>;

export const BulkPriceUpdateResponseSchema = z.object({
  updated: z.array(
    z.object({
      id: z.string().uuid(),
      previousPriceCents: z.number().int(),
      newPriceCents: z.number().int(),
    }),
  ),
});

export type BulkPriceUpdateResponse = z.infer<typeof BulkPriceUpdateResponseSchema>;

export const ActiveReservationsCountRequestSchema = z.object({
  vehicleIds: z.array(z.string().uuid()).min(1),
});

export type ActiveReservationsCountRequest = z.infer<typeof ActiveReservationsCountRequestSchema>;

export const ActiveReservationsCountResponseSchema = z.object({
  counts: z.record(z.string().uuid(), z.number().int().nonnegative()),
});

export type ActiveReservationsCountResponse = z.infer<typeof ActiveReservationsCountResponseSchema>;
