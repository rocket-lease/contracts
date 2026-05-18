import { z } from 'zod';

/**
 * Políticas de cancelación con sus términos
 */
export const CancellationPolicySchema = z.enum([
  'FLEXIBLE', // Reembolso total hasta 24h antes
  'MODERATE', // 50% hasta 48h antes
  'STRICT', // Sin reembolso dentro de 7 días
]);
export type CancellationPolicy = z.infer<typeof CancellationPolicySchema>;

/**
 * Opciones de seña/depósito
 */
export const DepositSchema = z.enum([
  'NONE', // No se toma seña
  'TEN_PERCENT', // 10%
  'FIFTY_PERCENT', // 50%
]);
export type Deposit = z.infer<typeof DepositSchema>;

/**
 * Opciones de kilometraje máximo
 */
export const MaxKilometrageSchema = z.union([
  z.object({
    type: z.literal('UNLIMITED'),
  }),
  z.object({
    type: z.literal('LIMITED'),
    value: z.number().positive('Kilometraje debe ser mayor a 0'),
  }),
]);
export type MaxKilometrage = z.infer<typeof MaxKilometrageSchema>;

/**
 * Restricciones de tiempo de alquiler (en días)
 */
export const RentalTimeConstraintsSchema = z.object({
  minDays: z.number().positive().optional(),
  maxDays: z.number().positive().optional(),
}).refine(
  (data) => !data.minDays || !data.maxDays || data.minDays <= data.maxDays,
  {
    message: 'Tiempo mínimo debe ser menor o igual al máximo',
    path: ['maxDays'],
  }
);
export type RentalTimeConstraints = z.infer<typeof RentalTimeConstraintsSchema>;

/**
 * Set completo de reglas de reserva
 */
export const ReservationRuleSetSchema = z.object({
  id: z.string().uuid(),
  rentalorId: z.string().uuid(),
  name: z.string().min(1, 'Nombre requerido').max(100),
  description: z.string().max(500).optional(),
  cancellationPolicy: CancellationPolicySchema,
  deposit: DepositSchema,
  maxKilometrage: MaxKilometrageSchema,
  rentalTimeConstraints: RentalTimeConstraintsSchema,
  vehicleCount: z.number().nonnegative().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ReservationRuleSet = z.infer<typeof ReservationRuleSetSchema>;

/**
 * Versión pública de un set de reglas (sin campos privados name/description)
 */
export const ReservationRuleSetPublicSchema = ReservationRuleSetSchema.omit({
  name: true,
  description: true,
  vehicleCount: true,
  createdAt: true,
  updatedAt: true,
});
export type ReservationRuleSetPublic = z.infer<typeof ReservationRuleSetPublicSchema>;

/**
 * Request para crear un nuevo set de reglas
 */
export const CreateReservationRuleSetRequestSchema = ReservationRuleSetSchema.omit({
  id: true,
  rentalorId: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateReservationRuleSetRequest = z.infer<typeof CreateReservationRuleSetRequestSchema>;

/**
 * Request para actualizar un set de reglas
 */
export const UpdateReservationRuleSetRequestSchema = CreateReservationRuleSetRequestSchema.partial();
export type UpdateReservationRuleSetRequest = z.infer<typeof UpdateReservationRuleSetRequestSchema>;

/**
 * Response para listar sets de reglas
 */
export const ReservationRuleSetListResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  cancellationPolicy: CancellationPolicySchema,
  deposit: DepositSchema,
  vehicleCount: z.number().nonnegative().default(0),
  createdAt: z.string().datetime(),
});
export type ReservationRuleSetListResponse = z.infer<typeof ReservationRuleSetListResponseSchema>;

/**
 * Response para crear un nuevo set
 */
export const CreateReservationRuleSetResponseSchema = z.object({
  id: z.string().uuid(),
});
export type CreateReservationRuleSetResponse = z.infer<typeof CreateReservationRuleSetResponseSchema>;

export const ReservationRuleSetEndpoints = {
  listMine: '/reservation-rules',
  getById: (id: string) => `/reservation-rules/${id}`,
  create: '/reservation-rules',
  update: (id: string) => `/reservation-rules/${id}`,
  delete: (id: string) => `/reservation-rules/${id}`,
} as const;
