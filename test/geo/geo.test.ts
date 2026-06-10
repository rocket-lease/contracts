import { describe, it, expect } from 'vitest';
import {
    CoordinatesSchema,
    MapBoundsSchema,
    MapSearchRequestSchema,
    ZoneClusterMarkerSchema,
    RentadoraMarkerSchema,
    MapMarkerSchema,
    MapSearchResponseSchema,
    RentadoraMarkerDetailSchema,
    GeoLocationsResponseSchema,
} from '../../src/geo/geo';

const validUuid = '018f8b3c-4d0e-7000-8000-000000000001';

describe('CoordinatesSchema', () => {
    it('parsea coordenadas válidas', () => {
        const r = CoordinatesSchema.parse({ latitude: -34.6, longitude: -58.4 });
        expect(r.latitude).toBe(-34.6);
    });

    it('rechaza latitud fuera de rango', () => {
        expect(CoordinatesSchema.safeParse({ latitude: 91, longitude: 0 }).success).toBe(false);
    });

    it('rechaza longitud fuera de rango', () => {
        expect(CoordinatesSchema.safeParse({ latitude: 0, longitude: 181 }).success).toBe(false);
    });
});

describe('MapBoundsSchema', () => {
    it('parsea bounds válidos', () => {
        const r = MapBoundsSchema.parse({ north: -34, south: -35, east: -58, west: -59 });
        expect(r.north).toBe(-34);
    });

    it('rechaza north menor que south', () => {
        expect(
            MapBoundsSchema.safeParse({ north: -35, south: -34, east: -58, west: -59 }).success,
        ).toBe(false);
    });
});

describe('MapSearchRequestSchema', () => {
    const bounds = { north: -34, south: -35, east: -58, west: -59 };
    const center = { latitude: -34.6, longitude: -58.4 };

    it('acepta búsqueda por bounds', () => {
        const r = MapSearchRequestSchema.parse({ bounds, zoom: 12 });
        expect(r.zoom).toBe(12);
    });

    it('acepta búsqueda por center + radiusKm', () => {
        const r = MapSearchRequestSchema.parse({ center, radiusKm: 10, zoom: 14 });
        expect('radiusKm' in r ? r.radiusKm : undefined).toBe(10);
    });

    it('rechaza bounds y center+radius a la vez', () => {
        expect(
            MapSearchRequestSchema.safeParse({ bounds, center, radiusKm: 10, zoom: 12 }).success,
        ).toBe(false);
    });

    it('rechaza cuando no viene ni bounds ni center+radius', () => {
        expect(MapSearchRequestSchema.safeParse({ zoom: 12 }).success).toBe(false);
    });

    it('rechaza zoom fuera de rango', () => {
        expect(MapSearchRequestSchema.safeParse({ bounds, zoom: 30 }).success).toBe(false);
    });

    it('acepta filtros opcionales', () => {
        const r = MapSearchRequestSchema.parse({
            bounds,
            zoom: 10,
            locationCode: 'caba-palermo',
            transmission: 'Automatico',
            characteristics: ['GPS'],
            isAccessible: true,
        });
        expect(r.transmission).toBe('Automatico');
        expect(r.locationCode).toBe('caba-palermo');
    });
});

describe('GeoLocationsResponseSchema', () => {
    it('parsea opciones jerarquicas', () => {
        const r = GeoLocationsResponseSchema.parse({
            locations: [
                {
                    code: 'caba',
                    name: 'CABA',
                    type: 'city',
                    city: 'CABA',
                    children: [
                        {
                            code: 'caba-palermo',
                            name: 'Palermo',
                            type: 'neighborhood',
                            parentCode: 'caba',
                            city: 'CABA',
                        },
                    ],
                },
            ],
        });
        expect(r.locations[0]?.children?.[0]?.code).toBe('caba-palermo');
    });
});

describe('ZoneClusterMarkerSchema', () => {
    it('parsea un pin de zona válido', () => {
        const r = ZoneClusterMarkerSchema.parse({
            type: 'zone',
            clusterId: 'z-9q8y',
            latitude: -34.6,
            longitude: -58.4,
            vehicleCount: 12,
            rentadoraCount: 4,
            minPriceCents: 350000,
            currency: 'ARS',
        });
        expect(r.vehicleCount).toBe(12);
    });

    it('rechaza vehicleCount negativo', () => {
        expect(
            ZoneClusterMarkerSchema.safeParse({
                type: 'zone',
                clusterId: 'z-1',
                latitude: 0,
                longitude: 0,
                vehicleCount: -1,
                rentadoraCount: 0,
                minPriceCents: 0,
                currency: 'ARS',
            }).success,
        ).toBe(false);
    });
});

describe('RentadoraMarkerSchema', () => {
    const valid = {
        type: 'rentadora' as const,
        clusterId: 'r-9q8y',
        latitude: -34.6,
        longitude: -58.4,
        rentadorId: validUuid,
        rentadorName: 'Autos del Sur',
        availableVehicleCount: 3,
        minPriceCents: 420000,
        currency: 'ARS' as const,
        reputationScore: 4.5,
        level: 'gold' as const,
        verified: true,
    };

    it('parsea un pin de rentadora válido', () => {
        const r = RentadoraMarkerSchema.parse(valid);
        expect(r.rentadorName).toBe('Autos del Sur');
    });

    it('rechaza reputationScore mayor a 5', () => {
        expect(RentadoraMarkerSchema.safeParse({ ...valid, reputationScore: 6 }).success).toBe(
            false,
        );
    });

    it('rechaza level inválido', () => {
        expect(RentadoraMarkerSchema.safeParse({ ...valid, level: 'diamond' }).success).toBe(
            false,
        );
    });
});

describe('MapMarkerSchema (unión discriminada)', () => {
    it('discrimina por type=zone', () => {
        const r = MapMarkerSchema.parse({
            type: 'zone',
            clusterId: 'z-1',
            latitude: 0,
            longitude: 0,
            vehicleCount: 1,
            rentadoraCount: 1,
            minPriceCents: 1000,
            currency: 'ARS',
        });
        expect(r.type).toBe('zone');
    });

    it('rechaza type desconocido', () => {
        expect(MapMarkerSchema.safeParse({ type: 'other' }).success).toBe(false);
    });
});

describe('MapSearchResponseSchema', () => {
    it('parsea respuesta con lista vacía', () => {
        const r = MapSearchResponseSchema.parse({ markers: [] });
        expect(r.markers).toEqual([]);
    });
});

describe('RentadoraMarkerDetailSchema', () => {
    it('parsea detalle con vehiclesPreview', () => {
        const r = RentadoraMarkerDetailSchema.parse({
            clusterId: 'r-1',
            latitude: -34.6,
            longitude: -58.4,
            rentadorId: validUuid,
            rentadorName: 'Autos del Sur',
            availableVehicleCount: 1,
            minPriceCents: 420000,
            currency: 'ARS',
            reputationScore: 4.5,
            level: 'gold',
            verified: true,
            vehiclesPreview: [
                {
                    id: validUuid,
                    brand: 'Toyota',
                    model: 'Yaris',
                    year: 2021,
                    basePriceCents: 420000,
                    photo: null,
                },
            ],
        });
        expect(r.vehiclesPreview).toHaveLength(1);
    });
});
