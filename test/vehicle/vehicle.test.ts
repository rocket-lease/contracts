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