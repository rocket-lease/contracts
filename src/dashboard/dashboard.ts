import { z } from 'zod';

/**
 * Métricas de flota para el rentador (US "Dashboard de métricas").
 * Dinero en centavos enteros, porcentajes 0–100, fechas ISO 8601.
 * Todo el cálculo (incluido el umbral de baja ocupación) vive en el backend;
 * el web solo renderiza.
 */

export const DashboardPeriodSchema = z.enum([
  'week',
  'month',
  'quarter',
  'custom',
]);
export type DashboardPeriod = z.infer<typeof DashboardPeriodSchema>;

/** Rango efectivo sobre el que se computaron las métricas. */
export const DashboardRangeSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});
export type DashboardRange = z.infer<typeof DashboardRangeSchema>;

/** Ingresos agregados por día, para el bar chart. */
export const DashboardRevenuePointSchema = z.object({
  date: z.string(), // YYYY-MM-DD (día local del rango)
  totalCents: z.number().int().nonnegative(),
});
export type DashboardRevenuePoint = z.infer<typeof DashboardRevenuePointSchema>;

/**
 * Métrica por vehículo. Sirve tanto para "ocupación por vehículo" como para
 * "vehículos más rentados" (mismo shape, distinto orden).
 */
/** Tramo ocupado del vehículo dentro del período (ya recortado al rango). */
export const DashboardOccupiedRangeSchema = z.object({
  startAt: z.string().datetime(),
  endAt: z.string().datetime(),
});
export type DashboardOccupiedRange = z.infer<
  typeof DashboardOccupiedRangeSchema
>;

export const DashboardVehicleMetricSchema = z.object({
  vehicleId: z.string().uuid(),
  brand: z.string(),
  model: z.string(),
  plate: z.string(),
  photoUrl: z.string().nullable(),
  occupancyRatePercent: z.number().min(0).max(100),
  // Tramos ocupados (para el calendario/timeline), recortados al período.
  occupiedRanges: z.array(DashboardOccupiedRangeSchema),
  // Ingresos atribuidos al período por FECHA DE INICIO del alquiler.
  revenueCents: z.number().int().nonnegative(),
  reservationCount: z.number().int().nonnegative(),
  cancellationRatePercent: z.number().min(0).max(100),
  lowOccupancy: z.boolean(),
});
export type DashboardVehicleMetric = z.infer<
  typeof DashboardVehicleMetricSchema
>;

/**
 * GET /dashboard/metrics?period=...
 * Cuando `period === 'custom'`, `from` y `to` son obligatorios y delimitan el
 * rango a analizar (ISO 8601, `from <= to`).
 */
export const DashboardSummaryRequestSchema = z
  .object({
    period: DashboardPeriodSchema.default('month'),
    from: z.string().datetime().optional(),
    to: z.string().datetime().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.period === 'custom') {
      if (!data.from || !data.to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'from and to are required when period is custom',
          path: ['from'],
        });
        return;
      }
      if (new Date(data.from) > new Date(data.to)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'from must be before or equal to to',
          path: ['from'],
        });
      }
    }
  });
export type DashboardSummaryRequest = z.infer<
  typeof DashboardSummaryRequestSchema
>;

/**
 * Vehículo con baja ocupación en los próximos días (señal independiente del
 * período seleccionado; ventana fija a futuro). Sugerencia: promover / ajustar
 * precio.
 */
export const DashboardAttentionVehicleSchema = z.object({
  vehicleId: z.string().uuid(),
  brand: z.string(),
  model: z.string(),
  plate: z.string(),
  upcomingOccupancyRatePercent: z.number().min(0).max(100),
});
export type DashboardAttentionVehicle = z.infer<
  typeof DashboardAttentionVehicleSchema
>;

export const DashboardSummaryResponseSchema = z.object({
  period: DashboardPeriodSchema,
  range: DashboardRangeSchema,
  totalVehicles: z.number().int().nonnegative(),
  activeReservations: z.number().int().nonnegative(),
  monthlyRevenueCents: z.number().int().nonnegative(),
  fleetOccupancyRatePercent: z.number().min(0).max(100),
  cancellationRatePercent: z.number().min(0).max(100),
  reputationScore: z.number().min(0),
  revenueByDay: z.array(DashboardRevenuePointSchema),
  vehicles: z.array(DashboardVehicleMetricSchema),
  topVehicles: z.array(DashboardVehicleMetricSchema),
  // Independiente del período: baja ocupación en los próximos días.
  attentionVehicles: z.array(DashboardAttentionVehicleSchema),
});
export type DashboardSummaryResponse = z.infer<
  typeof DashboardSummaryResponseSchema
>;

/** GET /dashboard/vehicles/:id/metrics?period=... */
export const DashboardVehicleDetailResponseSchema = z.object({
  period: DashboardPeriodSchema,
  range: DashboardRangeSchema,
  vehicle: DashboardVehicleMetricSchema,
  revenueByDay: z.array(DashboardRevenuePointSchema),
  reservationCount: z.number().int().nonnegative(),
  cancelledCount: z.number().int().nonnegative(),
});
export type DashboardVehicleDetailResponse = z.infer<
  typeof DashboardVehicleDetailResponseSchema
>;
