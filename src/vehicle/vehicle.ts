import { z } from 'zod';

const TransmissionSchema = z.enum(['Manual', 'Automatico', 'Semiautomatico']);

export const CreateVehicleRequestSchema = z.object({
    plate: z.string().trim().min(1, "Plate cannot be empty"),
    brand: z.string().min(1, "Brand is required"),
    model: z.string().min(1, "Model is required"),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    passengers: z.number().int().min(1),
    trunkLiters: z.number().min(0),
    transmission: TransmissionSchema,
    photos: z.array(z.string().url("Invalid photo URL format")).min(1),
    color: z.string().min(1, "Color is required"),
    mileage: z.number().min(0, "Mileage cannot be negative"),
    basePrice: z.number().gt(0, "Base price must be greater than zero"),
    description: z.string().nullable()
});
export type CreateVehicleRequest = z.infer<typeof CreateVehicleRequestSchema>;

export const UpdateVehicleRequestSchema = CreateVehicleRequestSchema.partial().omit({
    plate: true,
    brand: true,
    model: true,
    year: true,
    passengers: true,
    trunkLiters: true,
    transmission: true,
}).extend({
    enabled: z.boolean().optional(),
    isAccessible: z.boolean().optional(),
});
export type UpdateVehicleRequest = z.infer<typeof UpdateVehicleRequestSchema>;

export const CreateVehicleResponseSchema = z.object({
    id: z.string().uuid()
});
export type CreateVehicleResponse = z.infer<typeof CreateVehicleResponseSchema>;

export const GetVehicleResponseSchema = z.object({
    id: z.string().uuid(),
    ownerId: z.string().uuid(),
    plate: z.string().trim().min(1),
    brand: z.string().min(1),
    model: z.string().min(1),
    year: z.number().int(),
    enabled: z.boolean(),
    passengers: z.number().int(),
    trunkLiters: z.number(),
    transmission: TransmissionSchema,
    isAccessible: z.boolean(),
    photos: z.array(z.string().url()),
    color: z.string().min(1),
    mileage: z.number().min(0),
    basePrice: z.number().gt(0),
    description: z.string().nullable()
});
export type GetVehicleResponse = z.infer<typeof GetVehicleResponseSchema>;
