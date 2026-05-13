import { z } from 'zod';
import { GetVehicleResponseSchema } from '../vehicle/vehicle';

export const SearchVehiclesQuerySchema = z.object({
  city:      z.string().min(1, 'City is required'),
  startDate: z.string().date().optional(),
  endDate:   z.string().date().optional(),
});
export type SearchVehiclesQuery = z.infer<typeof SearchVehiclesQuerySchema>;

export const SearchVehiclesResponseSchema = z.object({
  vehicles: z.array(GetVehicleResponseSchema),
});
export type SearchVehiclesResponse = z.infer<typeof SearchVehiclesResponseSchema>;
