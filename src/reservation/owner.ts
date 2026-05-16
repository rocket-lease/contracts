// Schemas del lado rentador (US-46: panel de reservas).
// Separado de reservation.ts (que cubre el flujo del conductor) para mantener
// la lectura del módulo por actor.
import { z } from 'zod';
import {
  PaymentMethodSchema,
  ReservationStatusSchema,
  ReservationVehicleSummarySchema,
} from './reservation';

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
  holdExpiresAt: z.string().datetime().nullable(),
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
