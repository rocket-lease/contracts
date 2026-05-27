import { z } from 'zod';

export const CardDetailsSchema = z.object({
  lastFour: z.string().regex(/^\d{4}$/, 'Debe tener 4 dígitos').optional(),
  brand: z.string().min(1),
  expMonth: z.number().int().min(1).max(12),
  expYear: z.number().int().min(2000).max(2100),
  cardholderName: z.string().min(1),
});

export const WalletDetailsSchema = z.object({
  provider: z.string().min(1),
  alias: z.string().min(1),
});

export const BasePaymentMethodSchema = z.object({
  id: z.string().uuid(),
  createdAt: z.string().datetime(),
});

export const CardPaymentMethodSchema = BasePaymentMethodSchema.extend({
  type: z.literal('card'),
  details: CardDetailsSchema,
});

export const WalletPaymentMethodSchema = BasePaymentMethodSchema.extend({
  type: z.literal('digital_wallet'),
  details: WalletDetailsSchema,
});

export const SavedPaymentMethodSchema = z.discriminatedUnion('type', [
  CardPaymentMethodSchema,
  WalletPaymentMethodSchema,
]);

export const CreateCardPaymentMethodSchema = z.object({
  type: z.literal('card'),
  details: CardDetailsSchema,
});

export const CreateWalletPaymentMethodSchema = z.object({
  type: z.literal('digital_wallet'),
  details: WalletDetailsSchema,
});

export const CreateSavedPaymentMethodSchema = z.discriminatedUnion('type', [
  CreateCardPaymentMethodSchema,
  CreateWalletPaymentMethodSchema,
]);

export const UpdateCardPaymentMethodSchema = z.object({
  type: z.literal('card'),
  details: z.object({
    expMonth: z.number().int().min(1).max(12).optional(),
    expYear: z.number().int().min(2000).max(2100).optional(),
    cardholderName: z.string().min(1).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'Se debe enviar al menos un campo a actualizar',
  }),
});

export const UpdateWalletPaymentMethodSchema = z.object({
  type: z.literal('digital_wallet'),
  details: z.object({
    alias: z.string().min(1).optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'Se debe enviar al menos un campo a actualizar',
  }),
});

export const UpdateSavedPaymentMethodSchema = z.discriminatedUnion('type', [
  UpdateCardPaymentMethodSchema,
  UpdateWalletPaymentMethodSchema,
]);
