import { z } from 'zod';
import { CharacteristicSchema } from '../vehicle/vehicle';
import { UserLevelSchema } from '../profile/profile';

const TransmissionSchema = z.enum(['Manual', 'Automatico', 'Semiautomatico']);

export const CoordinatesSchema = z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
});
export type Coordinates = z.infer<typeof CoordinatesSchema>;

export const MapBoundsSchema = z
    .object({
        north: z.number().min(-90).max(90),
        south: z.number().min(-90).max(90),
        east: z.number().min(-180).max(180),
        west: z.number().min(-180).max(180),
    })
    .refine((b) => b.north >= b.south, {
        message: 'north must be greater than or equal to south',
    });
export type MapBounds = z.infer<typeof MapBoundsSchema>;

export const GeoLocationTypeSchema = z.enum([
    'province',
    'city',
    'locality',
    'neighborhood',
]);
export type GeoLocationType = z.infer<typeof GeoLocationTypeSchema>;

export type GeoLocationOption = {
    code: string;
    name: string;
    type: GeoLocationType;
    parentCode?: string | undefined;
    city?: string | undefined;
    center?: Coordinates | undefined;
    children?: GeoLocationOption[] | undefined;
};

export const GeoLocationOptionSchema: z.ZodType<GeoLocationOption> = z.lazy(() =>
    z.object({
        code: z.string().min(1),
        name: z.string().min(1),
        type: GeoLocationTypeSchema,
        parentCode: z.string().min(1).optional(),
        city: z.string().min(1).optional(),
        center: CoordinatesSchema.optional(),
        children: z.array(GeoLocationOptionSchema).optional(),
    }),
);

export const GeoLocationsResponseSchema = z.object({
    locations: z.array(GeoLocationOptionSchema),
});
export type GeoLocationsResponse = z.infer<typeof GeoLocationsResponseSchema>;

/**
 * Búsqueda de rentadoras para el mapa. Acepta viewport (`bounds`) XOR
 * "Cerca de mí" (`center` + `radiusKm`). El `zoom` define el nivel de
 * clustering server-side.
 */
export const MapSearchRequestSchema = z
    .object({
        bounds: MapBoundsSchema.optional(),
        center: CoordinatesSchema.optional(),
        radiusKm: z.number().positive().max(500).optional(),
        locationCode: z.string().min(1).optional(),
        zoom: z.number().int().min(0).max(22),
        transmission: TransmissionSchema.optional(),
        maxPriceDaily: z.number().int().positive().optional(),
        characteristics: z.array(CharacteristicSchema).optional(),
        isAccessible: z.boolean().optional(),
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
    })
    .superRefine((val, ctx) => {
        const hasBounds = val.bounds !== undefined;
        const hasRadius = val.center !== undefined && val.radiusKm !== undefined;
        if (hasBounds === hasRadius) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Provide either bounds or center+radiusKm, not both',
            });
        }
    });
export type MapSearchRequest = z.infer<typeof MapSearchRequestSchema>;

/** Pin de zona (zoom bajo): agrupa autos de varias rentadoras en un área. */
export const ZoneClusterMarkerSchema = z.object({
    type: z.literal('zone'),
    clusterId: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    vehicleCount: z.number().int().nonnegative(),
    rentadoraCount: z.number().int().nonnegative(),
    minPriceCents: z.number().int().nonnegative(),
    currency: z.literal('ARS'),
});
export type ZoneClusterMarker = z.infer<typeof ZoneClusterMarkerSchema>;

/** Pin de una rentadora en una ubicación (zoom medio/alto). */
export const RentadoraMarkerSchema = z.object({
    type: z.literal('rentadora'),
    clusterId: z.string().min(1),
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    rentadorId: z.string().uuid(),
    rentadorName: z.string().min(1),
    availableVehicleCount: z.number().int().nonnegative(),
    minPriceCents: z.number().int().nonnegative(),
    currency: z.literal('ARS'),
    reputationScore: z.number().min(0).max(5),
    level: UserLevelSchema,
    verified: z.boolean(),
});
export type RentadoraMarker = z.infer<typeof RentadoraMarkerSchema>;

export const MapMarkerSchema = z.discriminatedUnion('type', [
    ZoneClusterMarkerSchema,
    RentadoraMarkerSchema,
]);
export type MapMarker = z.infer<typeof MapMarkerSchema>;

export const MapSearchResponseSchema = z.object({
    markers: z.array(MapMarkerSchema),
});
export type MapSearchResponse = z.infer<typeof MapSearchResponseSchema>;

export const SearchSignalSchema = z.enum([
    'search',
    'vehicleView',
    'quote',
    'reservation',
]);
export type SearchSignal = z.infer<typeof SearchSignalSchema>;

export const LogVehicleViewRequestSchema = z.object({
    vehicleId: z.string().uuid(),
});
export type LogVehicleViewRequest = z.infer<typeof LogVehicleViewRequestSchema>;

export const MapVehiclePreviewSchema = z.object({
    id: z.string().uuid(),
    brand: z.string().min(1),
    model: z.string().min(1),
    year: z.number().int(),
    basePriceCents: z.number().int().gt(0),
    photo: z.string().nullable(),
});
export type MapVehiclePreview = z.infer<typeof MapVehiclePreviewSchema>;

/** Tarjeta expandida al tocar un pin de rentadora. */
export const RentadoraMarkerDetailSchema = RentadoraMarkerSchema.omit({
    type: true,
}).extend({
    vehiclesPreview: z.array(MapVehiclePreviewSchema),
});
export type RentadoraMarkerDetail = z.infer<typeof RentadoraMarkerDetailSchema>;
