import { z } from 'zod';

export const CreateVehicleRequestSchema = z.object({
  plate: z.string().trim().min(1),
  brand: z.string().trim().min(1),
  model: z.string().trim().min(1),
  color: z.string().trim().min(1),
  mileage: z.number().min(0),
  basePrice: z.number().gt(0),
  description: z.string().nullable(),
});
export type CreateVehicleRequest = z.infer<typeof CreateVehicleRequestSchema>;

export const GetVehicleResponseSchema = z.object({
  id: z.string().uuid(),
  plate: z.string().trim().min(1),
  brand: z.string().trim().min(1),
  model: z.string().trim().min(1),
  color: z.string().trim().min(1),
  mileage: z.number().min(0),
  basePrice: z.number().gt(0),
  description: z.string().nullable(),
});
export type GetVehicleResponse = z.infer<typeof GetVehicleResponseSchema>;

export const CreateVehicleResponseSchema = GetVehicleResponseSchema;
export type CreateVehicleResponse = z.infer<typeof CreateVehicleResponseSchema>;
