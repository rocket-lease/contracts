import { z } from 'zod';

/**
 * Schema para un vehículo recomendado.
 * Es un subconjunto de GetVehicleResponse con los campos necesarios
 * para mostrar la card de recomendación en la home del conductor.
 */
export const RecommendedVehicleSchema = z.object({
  id: z.string(),
  brand: z.string(),
  model: z.string(),
  transmission: z.string(),
  province: z.string(),
  city: z.string(),
  passengers: z.number(),
  isAccessible: z.boolean(),
  basePriceCents: z.number(),
  characteristics: z.array(z.string()),
  enabled: z.boolean(),
  photos: z.array(z.string()),
  year: z.number(),
  mileage: z.number(),
  color: z.string(),
  trunkLiters: z.number(),
  isPromoted: z.boolean(),
  autoAccept: z.boolean().nullable(),
  demandMultiplier: z.number(),
});
export type RecommendedVehicle = z.infer<typeof RecommendedVehicleSchema>;

/**
 * Respuesta de GET /recommendations.
 * Si no hay recomendaciones, section es string vacío y vehicles es empty array.
 */
export const RecommendedVehiclesResponseSchema = z.object({
  section: z.string(),
  vehicles: z.array(RecommendedVehicleSchema),
});
export type RecommendedVehiclesResponse = z.infer<typeof RecommendedVehiclesResponseSchema>;

/**
 * Schema para una alternativa de búsqueda.
 */
export const SearchAlternativeSchema = z.object({
  vehicle: RecommendedVehicleSchema,
  differences: z.array(z.string()),
});
export type SearchAlternative = z.infer<typeof SearchAlternativeSchema>;

export const SearchAlternativesResponseSchema = z.object({
  alternatives: z.array(SearchAlternativeSchema),
  message: z.string().optional(),
});
export type SearchAlternativesResponse = z.infer<typeof SearchAlternativesResponseSchema>;
