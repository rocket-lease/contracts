import { z } from 'zod';
import { UserPublicSummarySchema } from '../profile/profile';
import {
  ReservationRuleSetPublicSchema,
  CancellationPolicySchema,
  DepositPercentageSchema,
  MaxKilometrageSchema,
  RentalTimeConstraintsSchema,
} from '../vehicle/reservation-rules';

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
export const RESERVATION_STATUS = ReservationStatusSchema.enum;

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
  voucherToken: z.string().uuid(),
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
  reservationRuleSet: ReservationRuleSetPublicSchema.nullable().optional(),
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
  voucherToken: z.string().uuid().nullable().optional(),
  returnQrToken: z.string().uuid().nullable().optional(),
  startedAt: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  rejectionReason: z.string().nullable(),
  depositPercentageSnapshot: DepositPercentageSchema,
  basePriceCentsSnapshot: z.number().int().nonnegative(),
  cancellationPolicySnapshot: CancellationPolicySchema,
  maxKilometrageSnapshot: MaxKilometrageSchema,
  rentalTimeConstraintsSnapshot: RentalTimeConstraintsSchema,
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
  refundCents: z.number().int().nonnegative(),
  balanceInCents: z.number().int().nonnegative(),
  currency: z.literal('ARS'),
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

export const VoucherSchema = z.object({
  reservationId: z.string().uuid(),
  voucherToken: z.string().uuid(),
  status: ReservationStatusSchema,
  conductor: UserPublicSummarySchema,
  vehicle: ReservationVehicleSummarySchema,
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  totalCents: z.number().int().nonnegative(),
  currency: z.literal('ARS'),
  paymentMethod: PaymentMethodSchema,
  paidAt: z.string().datetime(),
});
export type Voucher = z.infer<typeof VoucherSchema>;

export const ConfirmPickupRequestSchema = z.object({
  voucherToken: z.string().uuid(),
});
export type ConfirmPickupRequest = z.infer<typeof ConfirmPickupRequestSchema>;

export const ConfirmPickupResponseSchema = z.object({
  reservationId: z.string().uuid(),
  status: z.literal('in_progress'),
  startedAt: z.string().datetime(),
  returnQrToken: z.string().uuid(),
});
export type ConfirmPickupResponse = z.infer<typeof ConfirmPickupResponseSchema>;

export const ConfirmReturnRequestSchema = z.object({
  returnQrToken: z.string().uuid(),
});
export type ConfirmReturnRequest = z.infer<typeof ConfirmReturnRequestSchema>;

export const ConfirmReturnResponseSchema = z.object({
  reservationId: z.string().uuid(),
  status: z.literal('completed'),
  completedAt: z.string().datetime(),
});
export type ConfirmReturnResponse = z.infer<typeof ConfirmReturnResponseSchema>;

export const VerifyVoucherResponseSchema = z.object({
  reservationId: z.string().uuid(),
  status: ReservationStatusSchema,
  conductor: UserPublicSummarySchema,
  vehicle: ReservationVehicleSummarySchema,
  rentador: UserPublicSummarySchema,
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  totalCents: z.number().int().nonnegative(),
  currency: z.literal('ARS'),
  paymentMethod: PaymentMethodSchema,
  paidAt: z.string().datetime(),
  isValid: z.boolean(),
});
export type VerifyVoucherResponse = z.infer<typeof VerifyVoucherResponseSchema>;
