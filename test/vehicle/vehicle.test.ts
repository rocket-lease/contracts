import { describe, it, expect } from 'vitest';
import { UpdateVehicleRequestSchema, GetVehicleResponseSchema } from '../../src/vehicle/vehicle';

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
