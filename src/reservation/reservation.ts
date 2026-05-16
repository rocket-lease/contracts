import { z } from 'zod';

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

export const ReservationRentadorSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});
export type ReservationRentadorSummary = z.infer<
  typeof ReservationRentadorSummarySchema
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
  rentador: ReservationRentadorSummarySchema,
});
export type GetReservationResponse = z.infer<
  typeof GetReservationResponseSchema
>;

export const ListMyReservationsResponseSchema = z.object({
  items: z.array(GetReservationResponseSchema),
});
export type ListMyReservationsResponse = z.infer<
  typeof ListMyReservationsResponseSchema
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

// --- US-46: Panel de reservas del rentador ---

export const ReservationConductorSummarySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  avatarUrl: z.string().nullable(),
});
export type ReservationConductorSummary = z.infer<
  typeof ReservationConductorSummarySchema
>;

export const OwnerReservationSchema = z.object({
  id: z.string().uuid(),
  vehicleId: z.string().uuid(),
  conductorId: z.string().uuid(),
  rentadorId: z.string().uuid(),
  status: ReservationStatusSchema,
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  totalCents: z.number().int().nonnegative(),
  currency: z.literal('ARS'),
  paymentMethod: PaymentMethodSchema.nullable(),
  paidAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  vehicle: ReservationVehicleSummarySchema,
  conductor: ReservationConductorSummarySchema,
});
export type OwnerReservation = z.infer<typeof OwnerReservationSchema>;

export const OwnerReservationsListRequestSchema = z.object({
  status: z.array(ReservationStatusSchema).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});
export type OwnerReservationsListRequest = z.infer<
  typeof OwnerReservationsListRequestSchema
>;

export const OwnerReservationsListResponseSchema = z.object({
  items: z.array(OwnerReservationSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type OwnerReservationsListResponse = z.infer<
  typeof OwnerReservationsListResponseSchema
>;
