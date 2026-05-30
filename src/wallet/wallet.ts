import { z } from 'zod';

export const WalletBalanceSchema = z.object({
  balanceCents: z.number().int().nonnegative(),
  currency: z.literal('ARS'),
});
export type WalletBalance = z.infer<typeof WalletBalanceSchema>;

export const WalletTransactionTypeSchema = z.enum([
  'reservation_credit',
  'withdrawal_debit',
]);
export type WalletTransactionType = z.infer<
  typeof WalletTransactionTypeSchema
>;

export const WalletTransactionSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  type: WalletTransactionTypeSchema,
  amountCents: z.number().int().positive(),
  currency: z.literal('ARS'),
  reservationId: z.string().uuid().nullable(),
  withdrawalId: z.string().uuid().nullable(),
  providerTransactionId: z.string().nullable(),
  bankAccountId: z.string().uuid().nullable(),
  bankAccountAlias: z.string().nullable(),
  bankAccountMaskedCbu: z.string().nullable(),
  providerStatus: z.enum(['processed', 'processing', 'failed']).nullable(),
  balanceAfterCents: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
});
export type WalletTransaction = z.infer<typeof WalletTransactionSchema>;

export const WalletTransactionsResponseSchema = z.object({
  items: z.array(WalletTransactionSchema),
});
export type WalletTransactionsResponse = z.infer<
  typeof WalletTransactionsResponseSchema
>;

export const WithdrawRequestSchema = z.object({
  bankAccountId: z.string().uuid(),
  amountCents: z.number().int().nonnegative(),
});
export type WithdrawRequest = z.infer<typeof WithdrawRequestSchema>;

export const WithdrawalStatusSchema = z.enum([
  'processing',
  'processed',
  'failed',
]);
export type WithdrawalStatus = z.infer<typeof WithdrawalStatusSchema>;

export const WithdrawalSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  bankAccountId: z.string().uuid(),
  bankAccountAlias: z.string(),
  bankAccountMaskedCbu: z.string(),
  bankAccountProvider: z.string(),
  amountCents: z.number().int().positive(),
  currency: z.literal('ARS'),
  providerName: z.string(),
  providerTransactionId: z.string(),
  providerStatus: z.enum(['processed', 'processing', 'failed']),
  status: WithdrawalStatusSchema,
  providerMetadata: z.record(z.unknown()),
  balanceAfterCents: z.number().int().nonnegative(),
  createdAt: z.string().datetime(),
  processedAt: z.string().datetime().nullable(),
});
export type Withdrawal = z.infer<typeof WithdrawalSchema>;

export const WithdrawResponseSchema = WithdrawalSchema;
export type WithdrawResponse = z.infer<typeof WithdrawResponseSchema>;

export const WalletEndpoints = {
  balance: '/wallet/balance',
  transactions: '/wallet/transactions',
  withdraw: '/wallet/withdrawals',
} as const;