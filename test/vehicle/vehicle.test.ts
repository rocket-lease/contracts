import { describe, expect, it } from 'vitest';
import {
  CreateVehicleRequestSchema,
  GetVehicleResponseSchema,
  UpdateVehicleRequestSchema,
} from '../../src/vehicle/vehicle';

const validUuid = '018f8b3c-4d0e-7000-8000-000000000001';

const baseVehicle = {
  id: validUuid,
  ownerId: validUuid,
  plate: 'ABC123',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2024,
  enabled: true,
  passengers: 5,
  trunkLiters: 470,
  transmission: 'Automatico' as const,
  isAccessible: false,
  photos: ['https://example.com/photo.jpg'],
  color: 'Gris',
  mileage: 12000,
  basePriceCents: 10000,
  discountTiers: [
    { minimumDays: 3, discountPercentage: 5 },
    { minimumDays: 7, discountPercentage: 15 },
  ],
  description: null,
  availableFrom: '2026-06-01T10:00:00.000Z',
  characteristics: [],
  province: 'AR-B',
  city: 'Buenos Aires',
  address: 'Calle 123',
  latitude: -34.6037,
  longitude: -58.3816,
  locationApproximate: false,
  autoAccept: null,
  isPromoted: false,
  reservationRuleSetId: null,
  reservationRuleSet: null,
  documentStatus: 'verified' as const,
  homeDeliveryEnabled: false,
  homeDeliveryFeeCents: null,
  homeReturnEnabled: false,
  homeReturnFeeCents: null,
};

describe('CreateVehicleRequestSchema', () => {
  it('parses a vehicle with discount tiers', () => {
    const parsed = CreateVehicleRequestSchema.parse({
      plate: 'ABC123',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2024,
      passengers: 5,
      trunkLiters: 470,
      isAccessible: false,
      transmission: 'Automatico',
      photos: ['https://example.com/photo.jpg'],
      color: 'Gris',
      mileage: 12000,
      basePriceCents: 10000,
      discountTiers: [
        { minimumDays: 3, discountPercentage: 5 },
        { minimumDays: 7, discountPercentage: 15 },
      ],
      description: null,
      availableFrom: '2026-06-01T10:00:00.000Z',
      characteristics: [],
      province: 'AR-B',
      city: 'Buenos Aires',
      address: 'Calle 123',
      latitude: -34.6037,
      longitude: -58.3816,
      autoAccept: null,
    });

    expect(parsed.discountTiers).toHaveLength(2);
  });
});

describe('UpdateVehicleRequestSchema', () => {
  it('allows updating discount tiers only', () => {
    const parsed = UpdateVehicleRequestSchema.parse({
      discountTiers: [{ minimumDays: 7, discountPercentage: 15 }],
    });

    expect(parsed.discountTiers).toHaveLength(1);
  });
});

describe('GetVehicleResponseSchema', () => {
  it('parses a public vehicle with discount tiers', () => {
    const parsed = GetVehicleResponseSchema.parse(baseVehicle);

    expect(parsed.discountTiers).toHaveLength(2);
    expect(parsed.discountTiers[1]?.discountPercentage).toBe(15);
  });
});

describe('UpdateVehicleRequestSchema — home delivery fields', () => {
  it('accepts homeDeliveryEnabled toggle', () => {
    const result = UpdateVehicleRequestSchema.parse({ homeDeliveryEnabled: true });
    expect(result.homeDeliveryEnabled).toBe(true);
  });

  it('accepts homeDeliveryFeeCents as null (disable fee)', () => {
    const result = UpdateVehicleRequestSchema.parse({ homeDeliveryFeeCents: null });
    expect(result.homeDeliveryFeeCents).toBeNull();
  });

  it('accepts homeDeliveryFeeCents as zero', () => {
    const result = UpdateVehicleRequestSchema.parse({ homeDeliveryFeeCents: 0 });
    expect(result.homeDeliveryFeeCents).toBe(0);
  });

  it('accepts homeReturnEnabled + homeReturnFeeCents together', () => {
    const result = UpdateVehicleRequestSchema.parse({
      homeReturnEnabled: true,
      homeReturnFeeCents: 500000,
    });
    expect(result.homeReturnEnabled).toBe(true);
    expect(result.homeReturnFeeCents).toBe(500000);
  });

  it('rejects negative homeDeliveryFeeCents', () => {
    expect(() => UpdateVehicleRequestSchema.parse({ homeDeliveryFeeCents: -1 })).toThrow();
  });

  it('rejects negative homeReturnFeeCents', () => {
    expect(() => UpdateVehicleRequestSchema.parse({ homeReturnFeeCents: -100 })).toThrow();
  });

  it('rejects unknown field (strict)', () => {
    expect(() => UpdateVehicleRequestSchema.parse({ unknownField: true })).toThrow();
  });
});

describe('GetVehicleResponseSchema — home delivery fields', () => {
  const base = {
    id: '018f8b3c-4d0e-7000-8000-000000000001',
    ownerId: '018f8b3c-4d0e-7000-8000-000000000002',
    plate: 'ABC123',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2022,
    enabled: true,
    passengers: 5,
    trunkLiters: 400,
    transmission: 'Manual' as const,
    isAccessible: false,
    photos: ['https://example.com/photo.jpg'],
    color: 'Blanco',
    mileage: 10000,
    basePriceCents: 500000,
    description: null,
    discountTiers: [],
    availableFrom: '2026-01-01',
    characteristics: [],
    province: 'AR-C',
    city: 'Buenos Aires',
    address: null,
    latitude: null,
    longitude: null,
    locationApproximate: false,
    autoAccept: null,
    homeDeliveryEnabled: false,
    homeDeliveryFeeCents: null,
    homeReturnEnabled: false,
    homeReturnFeeCents: null,
  };

  it('accepts vehicle with home delivery disabled', () => {
    const result = GetVehicleResponseSchema.parse(base);
    expect(result.homeDeliveryEnabled).toBe(false);
    expect(result.homeDeliveryFeeCents).toBeNull();
    expect(result.homeReturnEnabled).toBe(false);
    expect(result.homeReturnFeeCents).toBeNull();
  });

  it('accepts vehicle with home delivery enabled and fee', () => {
    const result = GetVehicleResponseSchema.parse({
      ...base,
      homeDeliveryEnabled: true,
      homeDeliveryFeeCents: 300000,
      homeReturnEnabled: true,
      homeReturnFeeCents: 200000,
    });
    expect(result.homeDeliveryEnabled).toBe(true);
    expect(result.homeDeliveryFeeCents).toBe(300000);
    expect(result.homeReturnEnabled).toBe(true);
    expect(result.homeReturnFeeCents).toBe(200000);
  });

  it('rejects missing homeDeliveryEnabled', () => {
    const { homeDeliveryEnabled: _, ...withoutField } = base;
    expect(() => GetVehicleResponseSchema.parse(withoutField)).toThrow();
  });
});
