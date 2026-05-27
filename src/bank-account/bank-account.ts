import { z } from 'zod';

export const BankAccountIdentifierSchema = z
  .string()
  .trim()
  .min(3, 'El nombre identificador debe tener al menos 3 caracteres')
  .max(50, 'El nombre identificador no puede superar 50 caracteres');

export const BankAccountAliasSchema = BankAccountIdentifierSchema;

export const BankAccountCbuSchema = z
  .string()
  .trim()
  .regex(/^\d{22}$/, 'CBU inválido');

export const MaskedBankAccountCbuSchema = z
  .string()
  .regex(/^\d{4}\*{14}\d{4}$/, 'CBU parcialmente oculto inválido');

export const BankAccountInputSchema = z.object({
  alias: BankAccountIdentifierSchema,
  cbu: BankAccountCbuSchema,
});
export type BankAccountInput = z.infer<typeof BankAccountInputSchema>;

export const CreateBankAccountRequestSchema = BankAccountInputSchema;
export type CreateBankAccountRequest = z.infer<
  typeof CreateBankAccountRequestSchema
>;

export const BankAccountSchema = z.object({
  id: z.string().uuid(),
  ownerId: z.string().uuid(),
  provider: z.string().trim().min(1).max(50),
  alias: BankAccountIdentifierSchema,
  cbu: BankAccountCbuSchema,
  maskedCbu: MaskedBankAccountCbuSchema,
  isActive: z.boolean(),
  isVerified: z.boolean(),
  deletedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type BankAccount = z.infer<typeof BankAccountSchema>;

export const CreateBankAccountResponseSchema = BankAccountSchema;
export type CreateBankAccountResponse = z.infer<
  typeof CreateBankAccountResponseSchema
>;

export const UpdateBankAccountResponseSchema = BankAccountSchema;
export type UpdateBankAccountResponse = z.infer<
  typeof UpdateBankAccountResponseSchema
>;

export const BankAccountListResponseSchema = BankAccountSchema.array();
export type BankAccountListResponse = z.infer<typeof BankAccountListResponseSchema>;

export const BankAccountEndpoints = {
  listMine: '/bank-accounts',
  create: '/bank-accounts',
  update: (id: string) => `/bank-accounts/${id}`,
  delete: (id: string) => `/bank-accounts/${id}`,
} as const;