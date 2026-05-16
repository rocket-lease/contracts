import { z } from 'zod';
import { UserPublicSummarySchema } from '../profile/profile';

export const ReservationStatusSchema = z.enum([
  'pending_payment',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'rejected',
  'expired',
]);
export type ReservationStatus = z.infer<typeof ReservationStatusSchema>;

export const PaymentMethodSchema = z.enum([
  'credit_card',
  'debit_card',
  'bank_transfer',
]);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const CreateReservationRequestSchema = z
  .object({
    vehicleId: z.string().uuid(),
    startAt: z.string().datetime(),
    endAt: z.string().datetime(),
    contractAccepted: z.boolean(),
  })
  .refine((d) => new Date(d.endAt).getTime() > new Date(d.startAt).getTime(), {
    message: 'endAt must be after startAt',
    path: ['endAt'],
  });
export type CreateReservationRequest = z.infer<
  typeof CreateReservationRequestSchema
>;

export const CreateReservationResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('pending_payment'),
  holdExpiresAt: z.string().datetime(),
  totalCents: z.number().int().nonnegative(),
  currency: z.literal('ARS'),
});
export type CreateReservationResponse = z.infer<
  typeof CreateReservationResponseSchema
>;

export const ConfirmReservationPaymentRequestSchema = z.object({
  paymentMethod: PaymentMethodSchema,
});
export type ConfirmReservationPaymentRequest = z.infer<
  typeof ConfirmReservationPaymentRequestSchema
>;

export const ConfirmReservationPaymentResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('confirmed'),
  paidAt: z.string().datetime(),
});
export type ConfirmReservationPaymentResponse = z.infer<
  typeof ConfirmReservationPaymentResponseSchema
>;

export const ReservationVehicleSummarySchema = z.object({
  id: z.string().uuid(),
  brand: z.string(),
  model: z.string(),
  year: z.number().int(),
  photo: z.string().nullable(),
});
export type ReservationVehicleSummary = z.infer<
  typeof ReservationVehicleSummarySchema
>;


export const GetReservationResponseSchema = z.object({
  id: z.string().uuid(),
  vehicleId: z.string().uuid(),
  conductorId: z.string().uuid(),
  rentadorId: z.string().uuid(),
  status: ReservationStatusSchema,
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  holdExpiresAt: z.string().datetime().nullable(),
  totalCents: z.number().int().nonnegative(),
  currency: z.literal('ARS'),
  paymentMethod: PaymentMethodSchema.nullable(),
  contractAcceptedAt: z.string().datetime().nullable(),
  paidAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  vehicle: ReservationVehicleSummarySchema,
  rentador: UserPublicSummarySchema,
});
export type GetReservationResponse = z.infer<
  typeof GetReservationResponseSchema
>;

export const CancelReservationResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('cancelled'),
});
export type CancelReservationResponse = z.infer<
  typeof CancelReservationResponseSchema
>;


export const BusyRangeSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});
export type BusyRange = z.infer<typeof BusyRangeSchema>;

export const VehicleBusyRangesResponseSchema = z.object({
  items: z.array(BusyRangeSchema),
});
export type VehicleBusyRangesResponse = z.infer<
  typeof VehicleBusyRangesResponseSchema
>;
