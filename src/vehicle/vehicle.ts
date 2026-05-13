import { z } from 'zod';

const TransmissionSchema = z.enum(['Manual', 'Automatico', 'Semiautomatico']);

export const CreateVehicleRequestSchema = z.object({
    plate: z.string().trim().min(1, "Plate cannot be empty"),
    brand: z.string().min(1, "Brand is required"),
    model: z.string().min(1, "Model is required"),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    passengers: z.number().int().min(1),
    trunkLiters: z.number().min(0),
    isAccessible: z.boolean(),
    transmission: TransmissionSchema,
    photos: z.array(z.string().url("Invalid photo URL format")).min(1),
    color: z.string().min(1, "Color is required"),
    mileage: z.number().min(0, "Mileage cannot be negative"),
    basePrice: z.number().gt(0, "Base price must be greater than zero"),
<<<<<<< HEAD
    description: z.string().nullable(),
    availableFrom: z.string().date("Invalid date format"),
    province: z.string().min(1, "Province ISO code is required"),
    city: z.string().min(1, "City name is required")
=======
    description: z.string().nullable()
>>>>>>> 8346ef43f52ba29866ed4db4979dd8b2c4bb8a3b
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
<<<<<<< HEAD
}).strict();
=======
});
>>>>>>> 8346ef43f52ba29866ed4db4979dd8b2c4bb8a3b
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
<<<<<<< HEAD
    description: z.string().nullable(),
    availableFrom: z.string().date(),
    province: z.string().min(1),
    city: z.string().min(1)
=======
    description: z.string().nullable()
>>>>>>> 8346ef43f52ba29866ed4db4979dd8b2c4bb8a3b
});
export type GetVehicleResponse = z.infer<typeof GetVehicleResponseSchema>;
