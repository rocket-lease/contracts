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
 * Porcentaje de seña requerido sobre el total del alquiler.
 *
 * - `null` indica que no se requiere seña.
 * - Si tiene valor, debe ser un entero entre 10 y 50.
 *
 * Reemplaza al enum cerrado `Deposit` que existía hasta sprint 2.
 * Migración: TEN_PERCENT→10, FIFTY_PERCENT→50, NONE→null.
 */
export const DepositPercentageSchema = z
  .number()
  .int('La seña debe ser un porcentaje entero')
  .min(10, 'La seña mínima es 10%')
  .max(50, 'La seña máxima es 50%')
  .nullable();
export type DepositPercentage = z.infer<typeof DepositPercentageSchema>;

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
 * Set completo de reglas de reserva.
 *
 * `vehicleId`:
 * - `null` (o ausente) → set compartido, el rentador lo puede asignar a múltiples vehículos.
 * - UUID de un vehículo → set privado de ese vehículo, no aparece en la lista de sets compartidos.
 *   El campo es inmutable post-creación (no se puede mover un set de un vehículo a otro).
 */
export const ReservationRuleSetSchema = z.object({
  id: z.string().uuid(),
  rentalorId: z.string().uuid(),
  vehicleId: z.string().uuid().nullable(),
  name: z.string().min(1, 'Nombre requerido').max(100),
  description: z.string().max(500).optional(),
  cancellationPolicy: CancellationPolicySchema,
  depositPercentage: DepositPercentageSchema,
  maxKilometrage: MaxKilometrageSchema,
  rentalTimeConstraints: RentalTimeConstraintsSchema,
  vehicleCount: z.number().nonnegative().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type ReservationRuleSet = z.infer<typeof ReservationRuleSetSchema>;

/**
 * Versión pública de un set de reglas (sin campos privados name/description).
 * También se omite `vehicleId`: la "privacidad" del set es metadata del rentador,
 * el conductor ve las reglas que le aplican sin importar si vienen de un set compartido o privado.
 */
export const ReservationRuleSetPublicSchema = ReservationRuleSetSchema.omit({
  vehicleId: true,
  name: true,
  description: true,
  vehicleCount: true,
  createdAt: true,
  updatedAt: true,
});
export type ReservationRuleSetPublic = z.infer<typeof ReservationRuleSetPublicSchema>;

/**
 * Request para crear un nuevo set de reglas.
 * `vehicleId` se incluye: `null` para set compartido, UUID para set privado de ese vehículo.
 */
export const CreateReservationRuleSetRequestSchema = ReservationRuleSetSchema.omit({
  id: true,
  rentalorId: true,
  vehicleCount: true,
  createdAt: true,
  updatedAt: true,
});
export type CreateReservationRuleSetRequest = z.infer<typeof CreateReservationRuleSetRequestSchema>;

/**
 * Request para actualizar un set de reglas.
 * `vehicleId` queda excluido — el scope (compartido/privado) es inmutable post-creación.
 * Si se necesita cambiar, hay que crear un set nuevo y borrar el viejo.
 */
export const UpdateReservationRuleSetRequestSchema = CreateReservationRuleSetRequestSchema
  .omit({ vehicleId: true })
  .partial();
export type UpdateReservationRuleSetRequest = z.infer<typeof UpdateReservationRuleSetRequestSchema>;

/**
 * Response para listar sets de reglas (compartidos del rentador).
 */
export const ReservationRuleSetListResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string().optional(),
  cancellationPolicy: CancellationPolicySchema,
  depositPercentage: DepositPercentageSchema,
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
  getPrivateByVehicle: (vehicleId: string) => `/vehicle/${vehicleId}/private-rule-set`,
} as const;
