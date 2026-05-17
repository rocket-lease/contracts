import { z } from 'zod';
import { UserPublicSummarySchema } from '../profile/profile';
import {
  PaymentMethodSchema,
  ReservationStatusSchema,
  ReservationVehicleSummarySchema,
} from './reservation';

export const ReservationListItemSchema = z.object({
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
  paidAt: z.string().datetime().nullable(),
  rejectionReason: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  vehicle: ReservationVehicleSummarySchema,
  conductor: UserPublicSummarySchema,
  rentador: UserPublicSummarySchema,
});
export type ReservationListItem = z.infer<typeof ReservationListItemSchema>;

export const ReservationRoleSchema = z.enum(['conductor', 'owner']);
export type ReservationRole = z.infer<typeof ReservationRoleSchema>;

export const ReservationsListRequestSchema = z.object({
  role: ReservationRoleSchema,
  status: z.array(ReservationStatusSchema).optional(),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});
export type ReservationsListRequest = z.infer<
  typeof ReservationsListRequestSchema
>;

export const ReservationsListResponseSchema = z.object({
  items: z.array(ReservationListItemSchema),
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type ReservationsListResponse = z.infer<
  typeof ReservationsListResponseSchema
>;
