import { describe, it, expect } from 'vitest';
import {
  AdminPricingZoneSchema,
  AdminPricingZonesResponseSchema,
} from '../../src/admin/pricing-zones';

const validZone = {
  h3Cell: '8829a1d6b3fffff',
  geometry: {
    type: 'Polygon' as const,
    coordinates: [[
      [-58.42, -34.60],
      [-58.41, -34.60],
      [-58.41, -34.61],
      [-58.42, -34.61],
      [-58.42, -34.60],
    ]],
  },
  supplyCount: 12,
  demandCount: 45,
  ratio: 3.75,
  avgMultiplier: 1.3,
  vehicleSampleIds: [
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
  ],
};

describe('AdminPricingZoneSchema', () => {
  it('parsea una zona válida', () => {
    const result = AdminPricingZoneSchema.parse(validZone);
    expect(result.h3Cell).toBe('8829a1d6b3fffff');
    expect(result.avgMultiplier).toBe(1.3);
  });

  it('rechaza avgMultiplier fuera de [0.7, 2.0]', () => {
    expect(() =>
      AdminPricingZoneSchema.parse({ ...validZone, avgMultiplier: 2.5 }),
    ).toThrow();
    expect(() =>
      AdminPricingZoneSchema.parse({ ...validZone, avgMultiplier: 0.5 }),
    ).toThrow();
  });

  it('rechaza supplyCount negativo', () => {
    expect(() =>
      AdminPricingZoneSchema.parse({ ...validZone, supplyCount: -1 }),
    ).toThrow();
  });

  it('rechaza más de 10 vehicleSampleIds', () => {
    const tooMany = Array.from({ length: 11 }, (_, i) =>
      `${'0'.repeat(8)}-0000-0000-0000-${String(i).padStart(12, '0')}`,
    );
    expect(() =>
      AdminPricingZoneSchema.parse({ ...validZone, vehicleSampleIds: tooMany }),
    ).toThrow();
  });

  it('rechaza geometry de tipo distinto a Polygon', () => {
    expect(() =>
      AdminPricingZoneSchema.parse({
        ...validZone,
        geometry: { type: 'Point', coordinates: [-58, -34] },
      }),
    ).toThrow();
  });
});

describe('AdminPricingZonesResponseSchema', () => {
  it('parsea response con zonas vacías', () => {
    const result = AdminPricingZonesResponseSchema.parse({
      generatedAt: '2026-06-04T20:00:00.000Z',
      zones: [],
    });
    expect(result.zones).toHaveLength(0);
  });

  it('parsea response con varias zonas', () => {
    const result = AdminPricingZonesResponseSchema.parse({
      generatedAt: '2026-06-04T20:00:00.000Z',
      zones: [validZone, { ...validZone, h3Cell: '8829a1d6b7fffff' }],
    });
    expect(result.zones).toHaveLength(2);
  });

  it('rechaza generatedAt que no sea ISO 8601', () => {
    expect(() =>
      AdminPricingZonesResponseSchema.parse({
        generatedAt: 'ayer',
        zones: [],
      }),
    ).toThrow();
  });
});
