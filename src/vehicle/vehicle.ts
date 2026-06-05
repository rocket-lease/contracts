import { z } from 'zod';
import { ReservationRuleSetPublicSchema } from './reservation-rules';
import { UserPublicSummarySchema } from '../profile/profile';
import { VehicleDocumentStatusSchema } from './vehicle-document';
import { PricingDiscountTiersSchema } from '../pricing/pricing';

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

const OwnerSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    avatarUrl: z.string().url().nullable(),
    level: z.string(),
    reputationScore: z.number(),
    verified: z.boolean(),
});
export type Owner = z.infer<typeof OwnerSchema>;

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
    basePriceCents: z.number().int().gt(0, "Base price must be greater than zero"),
    discountTiers: PricingDiscountTiersSchema.optional(),
    description: z.string().nullable(),
    availableFrom: z.string(),
    characteristics: z.array(CharacteristicSchema).default([]),
    province: z.string().min(1, "Province ISO code is required"),
    city: z.string().min(1, "City name is required"),
    address: z.string().min(1, "Address is required"),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    autoAccept: z.boolean().nullable().optional()
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
    reservationRuleSetId: z.string().uuid().nullable().optional(),
    characteristics: z.array(CharacteristicSchema).optional(),
    discountTiers: PricingDiscountTiersSchema.optional(),
    autoAccept: z.boolean().nullable().optional(),
    homeDeliveryEnabled: z.boolean().optional(),
    homeDeliveryFeeCents: z.number().int().nonnegative().nullable().optional(),
    homeReturnEnabled: z.boolean().optional(),
    homeReturnFeeCents: z.number().int().nonnegative().nullable().optional(),
    dynamicPricingEnabled: z.boolean().optional(),
}).strict();
export type UpdateVehicleRequest = z.infer<typeof UpdateVehicleRequestSchema>;

export const CreateVehicleResponseSchema = z.object({
    id: z.string().uuid()
});
export type CreateVehicleResponse = z.infer<typeof CreateVehicleResponseSchema>;

export const VehicleOwnerSchema = UserPublicSummarySchema.extend({
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
    basePriceCents: z.number().int().gt(0),
    discountTiers: PricingDiscountTiersSchema,
    description: z.string().nullable(),
    availableFrom: z.string(),
    characteristics: z.array(CharacteristicSchema),
    // owner: OwnerSchema.optional(),
    province: z.string().min(1),
    city: z.string().min(1),
    // Nullable: los vehículos migrados antes del feature de mapa solo tienen
    // lat/lng aproximados de centroide y aún no tienen address.
    address: z.string().nullable(),
    latitude: z.number().min(-90).max(90).nullable(),
    longitude: z.number().min(-180).max(180).nullable(),
    locationApproximate: z.boolean(),
    owner: VehicleOwnerSchema.optional(),
    reservationRuleSetId: z.string().uuid().nullable().optional(),
    reservationRuleSet: ReservationRuleSetPublicSchema.nullable().optional(),
    autoAccept: z.boolean().nullable(),
    isPromoted: z.boolean().optional(),
    documentStatus: VehicleDocumentStatusSchema.optional(),
    homeDeliveryEnabled: z.boolean(),
    homeDeliveryFeeCents: z.number().int().nonnegative().nullable(),
    homeReturnEnabled: z.boolean(),
    homeReturnFeeCents: z.number().int().nonnegative().nullable(),
    dynamicPricingEnabled: z.boolean().default(false),
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

export const PromotionDurationSchema = z.object({
  days: z.number().int().positive(),
  valueInCents: z.number().int().nonnegative(),
});
export type PromotionDuration = z.infer<typeof PromotionDurationSchema>;

export const PromotionDurationsResponseSchema = z.array(PromotionDurationSchema);
export type PromotionDurationsResponse = z.infer<typeof PromotionDurationsResponseSchema>;

export const PromotionStatusEnum = z.enum(['active', 'pending_approval']);
export type PromotionStatusEnum = z.infer<typeof PromotionStatusEnum>;

export const PromoteVehicleRequestSchema = z.object({
  durationDays: z.number().int().gte(0).lte(30),
  startDate: z.string().datetime(),
  paymentMethod: z.enum(['credit_card', 'debit_card', 'bank_transfer', 'digital_wallet']),
  walletProvider: z.string().optional(),
});
export type PromoteVehicleRequest = z.infer<typeof PromoteVehicleRequestSchema>;

export const PromoteVehicleResponseSchema = z.discriminatedUnion('status', [
  z.object({
    vehicleId: z.string().uuid(),
    totalCents: z.number().int().nonnegative(),
    startDate: z.string().datetime(),
    status: z.literal('active'),
    paidAt: z.string().datetime(),
    transactionId: z.string(),
  }),
  z.object({
    vehicleId: z.string().uuid(),
    totalCents: z.number().int().nonnegative(),
    startDate: z.string().datetime(),
    status: z.literal('pending_approval'),
    transferCode: z.string(),
    transferAlias: z.string(),
    transferExpiresAt: z.string().datetime(),
  }),
]);
export type PromoteVehicleResponse = z.infer<typeof PromoteVehicleResponseSchema>;

export const PromotionStatusSchema = z.discriminatedUnion('status', [
  z.object({
    status: z.literal('active'),
    startDate: z.string().datetime(),
    endsAt: z.string().datetime(),
    durationDays: z.number().int().gte(0).lte(30),
    totalCents: z.number().int().nonnegative(),
    paidAt: z.string().datetime(),
    transactionId: z.string(),
  }),
  z.object({
    status: z.literal('pending_approval'),
    startDate: z.string().datetime(),
    endsAt: z.string().datetime(),
    durationDays: z.number().int().gte(0).lte(30),
    totalCents: z.number().int().nonnegative(),
    transferCode: z.string(),
    transferAlias: z.string(),
    transferExpiresAt: z.string().datetime(),
  }),
]);
export type PromotionStatus = z.infer<typeof PromotionStatusSchema>;

export const GetPromotionResponseSchema = z.object({
  active: z.boolean(),
  promotion: PromotionStatusSchema.nullable().optional(),
});
export type GetPromotionResponse = z.infer<typeof GetPromotionResponseSchema>;
