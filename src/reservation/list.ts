// Listado paginado de reservas — endpoint unificado `GET /reservations`.
// El query param `role` indica desde qué perspectiva pide el usuario:
//   - 'conductor' → reservas que yo creé
//   - 'owner'     → reservas sobre vehículos que yo publiqué
// El response siempre incluye conductor + rentador + vehicle para que la UI
// pueda renderizar ambos lados sin segundos round-trips.
import { z } from 'zod';
import { UserPublicSummarySchema } from '../profile/profile';
import type { UserPublicSummary } from '../profile/profile';
import {
  PaymentMethodSchema,
  ReservationRentadorSummarySchema,
  ReservationStatusSchema,
  ReservationVehicleSummarySchema,
} from './reservation';

export const ReservationConductorSummarySchema = UserPublicSummarySchema;
export type ReservationConductorSummary = UserPublicSummary;

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
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  vehicle: ReservationVehicleSummarySchema,
  conductor: ReservationConductorSummarySchema,
  rentador: ReservationRentadorSummarySchema,
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
