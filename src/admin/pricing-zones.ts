import { z } from 'zod';

const GeoJsonPolygonSchema = z.object({
  type: z.literal('Polygon'),
  coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))),
});
export type GeoJsonPolygon = z.infer<typeof GeoJsonPolygonSchema>;

export const AdminPricingZoneSchema = z.object({
  h3Cell: z.string().min(1),
  geometry: GeoJsonPolygonSchema,
  supplyCount: z.number().int().nonnegative(),
  demandCount: z.number().nonnegative(),
  ratio: z.number().nonnegative(),
  avgMultiplier: z.number().min(0.7).max(2.0),
  vehicleSampleIds: z.array(z.string().uuid()).max(10),
});
export type AdminPricingZone = z.infer<typeof AdminPricingZoneSchema>;

export const AdminPricingZonesResponseSchema = z.object({
  generatedAt: z.string().datetime(),
  zones: z.array(AdminPricingZoneSchema),
});
export type AdminPricingZonesResponse = z.infer<typeof AdminPricingZonesResponseSchema>;
