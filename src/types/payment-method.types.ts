import { z } from 'zod';
import {
  SavedPaymentMethodSchema,
  CreateSavedPaymentMethodSchema,
  UpdateSavedPaymentMethodSchema,
} from '../schemas/payment-method.schema';

export type SavedPaymentMethod = z.infer<typeof SavedPaymentMethodSchema>;
export type CreateSavedPaymentMethod = z.infer<typeof CreateSavedPaymentMethodSchema>;
export type UpdateSavedPaymentMethod = z.infer<typeof UpdateSavedPaymentMethodSchema>;
