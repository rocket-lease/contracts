import { z } from 'zod';

export const CreateVehicleRequestSchema = z.object({
    plate: z.string().trim().min(1, "Plate cannot be empty"),
    brand: z.string().min(1, "Brand is required"),
    model: z.string().min(1, "Model is required"),
    color: z.string().min(1, "Color is required"),
    mileage: z.number().min(0, "Mileage cannot be negative"),
    basePrice: z.number().gt(0, "Base price must be greater than zero"),
    description: z.string().nullable()
});
export type CreateVehicleRequest = z.infer<typeof CreateVehicleRequestSchema>;

export const CreateVehicleResponseSchema = z.object({
    id: z.string()
});
export type CreateVehicleResponse = z.infer<typeof CreateVehicleResponseSchema>;

export const GetVehicleResponseSchema = z.object({
    id: z.string(),
    plate: z.string().trim().min(1, "Plate cannot be empty"),
    brand: z.string().min(1, "Brand is required"),
    model: z.string().min(1, "Model is required"),
    color: z.string().min(1, "Color is required"),
    mileage: z.number().min(0, "Mileage cannot be negative"),
    basePrice: z.number().gt(0, "Base price must be greater than zero"),
    description: z.string().nullable()
});
export type GetVehicleResponse = z.infer<typeof GetVehicleResponseSchema>;

export const GetVehicleDetailsResponseSchema = z.object({
    id: z.string(),
    brand: z.string().min(1, "Brand is required"),
    model: z.string().min(1, "Model is required"),
    year: z.number().int(),
    renter: z.object({
        id: z.string(),
        name: z.string().min(1, "Name is required"),
    }),
    dailyPrice: z.number().int(),
    description: z.string().nullable(),
    available: z.boolean(),
    images: z.array(z.string()),
    features: z.object({
        automatic: z.boolean(),
        kilometers: z.number().int(),
        trunkLiters: z.number().int(),
    }),
    accessFeatures: z.array(z.string()),
});
export type GetVehicleDetailsResponse = z.infer<typeof GetVehicleDetailsResponseSchema>;
