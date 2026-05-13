import { z } from 'zod';

const TransmissionSchema = z.enum(['Manual', 'Automatico', 'Semiautomatico']);

export const CharacteristicSchema = z.enum([
    'GPS',
    'BABY_SEAT',
    'SUNROOF',
    'PET_FRIENDLY',
    'WIFI',
    'USB_CHARGER',
    'AUX_CABLE',
    'BLUETOOTH',
]);
export type Characteristic = z.infer<typeof CharacteristicSchema>;

export const CreateVehicleRequestSchema = z.object({
    plate: z.string().trim().min(1, "Plate cannot be empty"),
    brand: z.string().min(1, "Brand is required"),
    model: z.string().min(1, "Model is required"),
    year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
    passengers: z.number().int().min(1),
    trunkLiters: z.number().min(0),
    isAccessible: z.boolean(),
    transmission: TransmissionSchema,
    photos: z.array(z.string()).min(1),
    color: z.string().min(1, "Color is required"),
    mileage: z.number().min(0, "Mileage cannot be negative"),
    basePrice: z.number().gt(0, "Base price must be greater than zero"),
    description: z.string().nullable(),
    availableFrom: z.string(),
    province: z.string().min(1, "Province ISO code is required"),
    city: z.string().min(1, "City name is required"),
    characteristics: z.array(CharacteristicSchema).optional()
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
    characteristics: z.array(CharacteristicSchema).optional()
}).strict();
export type UpdateVehicleRequest = z.infer<typeof UpdateVehicleRequestSchema>;

export const CreateVehicleResponseSchema = z.object({
    id: z.string().uuid()
});
export type CreateVehicleResponse = z.infer<typeof CreateVehicleResponseSchema>;

export const VehicleOwnerSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    avatarUrl: z.string().nullable(),
    level: z.enum(['bronze', 'silver', 'gold', 'platinum']),
    reputationScore: z.number(),
    verified: z.boolean(),
});
export type VehicleOwner = z.infer<typeof VehicleOwnerSchema>;

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
    photos: z.array(z.string()),
    color: z.string().min(1),
    mileage: z.number().min(0),
    basePrice: z.number().gt(0),
    description: z.string().nullable(),
    availableFrom: z.string(),
    province: z.string().min(1),
    city: z.string().min(1),
    characteristics: z.array(CharacteristicSchema).optional(),
    owner: VehicleOwnerSchema.optional(),
});
export type GetVehicleResponse = z.infer<typeof GetVehicleResponseSchema>;

export const VehicleCharacteristicsResponseSchema = z.object({
    characteristics: z.array(CharacteristicSchema)
});
export type VehicleCharacteristicsResponse = z.infer<typeof VehicleCharacteristicsResponseSchema>;

export const VehicleSearchPreferencesSchema = z.object({
    transmission: TransmissionSchema.optional(),
    maxPriceDaily: z.number().optional(),
    characteristics: z.array(CharacteristicSchema).optional()
});
export type VehicleSearchPreferences = z.infer<typeof VehicleSearchPreferencesSchema>;
