import { z } from 'zod';
import { UserPublicSummarySchema } from '../profile/profile';

export const ReservationStatusSchema = z.enum([
  'pending_approval',
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
  'digital_wallet',
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
  status: z.union([z.literal('pending_approval'), z.literal('pending_payment')]),
  holdExpiresAt: z.string().datetime(),
  totalCents: z.number().int().nonnegative(),
  currency: z.literal('ARS'),
});
export type CreateReservationResponse = z.infer<
  typeof CreateReservationResponseSchema
>;

export const ConfirmReservationPaymentRequestSchema = z.object({
  paymentMethod: PaymentMethodSchema,
  walletProvider: z.string().optional(),
});
export type ConfirmReservationPaymentRequest = z.infer<
  typeof ConfirmReservationPaymentRequestSchema
>;

export const ConfirmReservationPaymentResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('confirmed'),
  paidAt: z.string().datetime(),
  voucher: z.object({ qrCode: z.string() }).optional(),
  notified: z.boolean().optional(),
});
export type ConfirmReservationPaymentResponse = z.infer<
  typeof ConfirmReservationPaymentResponseSchema
>;

export const PaymentMethodsResponseSchema = z.object({
  methods: z.array(PaymentMethodSchema),
});
export type PaymentMethodsResponse = z.infer<
  typeof PaymentMethodsResponseSchema
>;

export const InitiateTransferResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('pending_approval'),
  transferCode: z.string(),
  transferAlias: z.string(),
  transferExpiresAt: z.string().datetime(),
  totalCents: z.number().int().nonnegative(),
  currency: z.literal('ARS'),
});
export type InitiateTransferResponse = z.infer<
  typeof InitiateTransferResponseSchema
>;

export const ConfirmTransferResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('confirmed'),
  paidAt: z.string().datetime(),
  voucher: z.object({ qrCode: z.string() }).optional(),
  notified: z.boolean().optional(),
});
export type ConfirmTransferResponse = z.infer<
  typeof ConfirmTransferResponseSchema
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
  walletProvider: z.string().nullable(),
  contractAcceptedAt: z.string().datetime().nullable(),
  paidAt: z.string().datetime().nullable(),
  transferExpiresAt: z.string().datetime().nullable(),
  transferCode: z.string().nullable(),
  transferAlias: z.string().nullable(),
  rejectionReason: z.string().nullable(),
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

export const ApproveReservationResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('pending_payment'),
  holdExpiresAt: z.string().datetime(),
});
export type ApproveReservationResponse = z.infer<
  typeof ApproveReservationResponseSchema
>;

export const RejectReservationRequestSchema = z.object({
  reason: z.string().trim().max(280).optional(),
});
export type RejectReservationRequest = z.infer<
  typeof RejectReservationRequestSchema
>;

export const RejectReservationResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('rejected'),
  rejectionReason: z.string().nullable(),
});
export type RejectReservationResponse = z.infer<
  typeof RejectReservationResponseSchema
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
