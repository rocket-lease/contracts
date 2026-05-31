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
  'pending_balance',
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

export const PaymentModeSchema = z.enum(['full', 'deposit']);
export type PaymentMode = z.infer<typeof PaymentModeSchema>;

export const ConfirmReservationPaymentRequestSchema = z.object({
  paymentMethod: PaymentMethodSchema,
  walletProvider: z.string().optional(),
  // Ausente o 'full' => paga el total. 'deposit' => paga solo la seña (US-26).
  paymentMode: PaymentModeSchema.optional(),
});
export type ConfirmReservationPaymentRequest = z.infer<
  typeof ConfirmReservationPaymentRequestSchema
>;

export const ConfirmReservationPaymentResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.union([z.literal('confirmed'), z.literal('pending_balance')]),
  paidAt: z.string().datetime(),
  // Present when status === 'confirmed' (full payment closes the reservation).
  voucherToken: z.string().uuid().nullable().optional(),
  // Amount actually charged in this call (deposit or full total).
  paidCents: z.number().int().nonnegative(),
  // Remaining balance still due. 0 when status === 'confirmed'.
  balanceCents: z.number().int().nonnegative(),
  // Deadline to pay the balance. Null when status === 'confirmed'.
  balanceDueAt: z.string().datetime().nullable(),
});
export type ConfirmReservationPaymentResponse = z.infer<
  typeof ConfirmReservationPaymentResponseSchema
>;

export const ConfirmReservationBalanceRequestSchema = z.object({
  paymentMethod: PaymentMethodSchema,
  walletProvider: z.string().optional(),
});
export type ConfirmReservationBalanceRequest = z.infer<
  typeof ConfirmReservationBalanceRequestSchema
>;

export const ConfirmReservationBalanceResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('confirmed'),
  paidAt: z.string().datetime(),
  voucherToken: z.string().uuid(),
  balancePaidCents: z.number().int().nonnegative(),
});
export type ConfirmReservationBalanceResponse = z.infer<
  typeof ConfirmReservationBalanceResponseSchema
>;

export const PaymentMethodsResponseSchema = z.object({
  methods: z.array(PaymentMethodSchema),
});
export type PaymentMethodsResponse = z.infer<
  typeof PaymentMethodsResponseSchema
>;

export const InitiateTransferRequestSchema = z.object({
  paymentMode: PaymentModeSchema.optional(),
});
export type InitiateTransferRequest = z.infer<
  typeof InitiateTransferRequestSchema
>;

export const InitiateTransferResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('pending_approval'),
  transferCode: z.string(),
  transferAlias: z.string(),
  transferExpiresAt: z.string().datetime(),
  totalCents: z.number().int().nonnegative(),
  // Amount to be transferred (deposit or full total depending on paymentMode).
  amountCents: z.number().int().nonnegative(),
  currency: z.literal('ARS'),
});
export type InitiateTransferResponse = z.infer<
  typeof InitiateTransferResponseSchema
>;

export const ConfirmTransferResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.union([z.literal('confirmed'), z.literal('pending_balance')]),
  paidAt: z.string().datetime(),
  voucher: z.object({ qrCode: z.string() }).optional(),
  notified: z.boolean().optional(),
});
export type ConfirmTransferResponse = z.infer<
  typeof ConfirmTransferResponseSchema
>;

// Balance transfer (paying the remaining balance of a pending_balance
// reservation via bank transfer).
export const InitiateBalanceTransferResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('pending_balance'),
  transferCode: z.string(),
  transferAlias: z.string(),
  transferExpiresAt: z.string().datetime(),
  amountCents: z.number().int().nonnegative(),
  currency: z.literal('ARS'),
});
export type InitiateBalanceTransferResponse = z.infer<
  typeof InitiateBalanceTransferResponseSchema
>;

export const ConfirmBalanceTransferResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('confirmed'),
  paidAt: z.string().datetime(),
  voucher: z.object({ qrCode: z.string() }).optional(),
  notified: z.boolean().optional(),
});
export type ConfirmBalanceTransferResponse = z.infer<
  typeof ConfirmBalanceTransferResponseSchema
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


export const ReservationChainItemSchema = z.object({
  id: z.string().uuid(),
  status: ReservationStatusSchema,
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
  totalCents: z.number().int().nonnegative(),
  parentReservationId: z.string().uuid().nullable(),
});
export type ReservationChainItem = z.infer<typeof ReservationChainItemSchema>;

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
  depositPaidCents: z.number().int().nonnegative().nullable().optional(),
  depositPaidAt: z.string().datetime().nullable().optional(),
  balanceDueAt: z.string().datetime().nullable().optional(),
  balanceReminderSentAt: z.string().datetime().nullable().optional(),
  transferExpiresAt: z.string().datetime().nullable(),
  transferCode: z.string().nullable(),
  transferAlias: z.string().nullable(),
  transferPaymentMode: z
    .enum(['full', 'deposit', 'balance'])
    .nullable()
    .optional(),
  voucherToken: z.string().uuid().nullable().optional(),
  returnQrToken: z.string().uuid().nullable().optional(),
  startedAt: z.string().datetime().nullable().optional(),
  completedAt: z.string().datetime().nullable().optional(),
  cancelledAt: z.string().datetime().nullable().optional(),
  cancelledBy: z.enum(['owner', 'conductor']).nullable().optional(),
  cancellationReason: z.string().nullable().optional(),
  rejectionReason: z.string().nullable(),
  parentReservationId: z.string().uuid().nullable().optional(),
  chain: z.array(ReservationChainItemSchema).optional(),
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

export const CancelledBySchema = z.enum(['owner', 'conductor']);
export type CancelledBy = z.infer<typeof CancelledBySchema>;

export const CancelReservationRequestSchema = z.object({
  reason: z.string().trim().max(280).optional(),
});
export type CancelReservationRequest = z.infer<typeof CancelReservationRequestSchema>;

export const CancelReservationResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.literal('cancelled'),
  cancelledBy: CancelledBySchema,
  refundCents: z.number().int().nonnegative(),
  reputationPenalty: z.number().int().nonpositive(),
  balanceInCents: z.number().int().nonnegative(),
  currency: z.literal('ARS'),
});
export type CancelReservationResponse = z.infer<
  typeof CancelReservationResponseSchema
>;

export const ApproveReservationResponseSchema = z.object({
  id: z.string().uuid(),
  status: z.union([z.literal('pending_payment'), z.literal('confirmed')]),
  holdExpiresAt: z.string().datetime().nullable(),
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

export const ExtendReservationRequestSchema = z.object({
  newEndAt: z.string().datetime(),
});
export type ExtendReservationRequest = z.infer<
  typeof ExtendReservationRequestSchema
>;

export const ExtendReservationResponseSchema = z.object({
  id: z.string().uuid(),
  parentReservationId: z.string().uuid(),
  status: z.union([z.literal('pending_approval'), z.literal('pending_payment')]),
  holdExpiresAt: z.string().datetime(),
  totalCents: z.number().int().nonnegative(),
  currency: z.literal('ARS'),
  requiresApproval: z.boolean(),
});
export type ExtendReservationResponse = z.infer<
  typeof ExtendReservationResponseSchema
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
