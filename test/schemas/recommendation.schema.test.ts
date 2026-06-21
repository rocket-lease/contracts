import { describe, it, expect } from 'vitest';
import {
  RecommendedVehicleSchema,
  RecommendedVehiclesResponseSchema,
  SearchAlternativeSchema,
  SearchAlternativesResponseSchema,
} from '../../src/schemas/recommendation.schema';

const validVehicle = {
  id: '018f8b3c-4d0e-7000-8000-000000000001',
  brand: 'Ford',
  model: 'Focus',
  transmission: 'Manual',
  province: 'B',
  city: 'CABA',
  passengers: 5,
  isAccessible: false,
  basePriceCents: 4500000,
  characteristics: ['GPS', 'BLUETOOTH'],
  enabled: true,
  photos: ['https://i.com/rec001.jpg'],
  year: 2024,
  mileage: 10000,
  color: 'Azul',
  trunkLiters: 400,
  isPromoted: false,
  autoAccept: null,
  demandMultiplier: 1,
};

describe('RecommendedVehicleSchema', () => {
  it('parses a valid vehicle', () => {
    expect(RecommendedVehicleSchema.parse(validVehicle)).toEqual(validVehicle);
  });

  it('rejects missing required field', () => {
    const { id, ...withoutId } = validVehicle;
    expect(RecommendedVehicleSchema.safeParse(withoutId).success).toBe(false);
  });

  it('rejects wrong type for basePriceCents', () => {
    expect(
      RecommendedVehicleSchema.safeParse({ ...validVehicle, basePriceCents: 'not-a-number' }).success,
    ).toBe(false);
  });
});

describe('RecommendedVehiclesResponseSchema', () => {
  it('parses valid response with vehicles', () => {
    const response = {
      section: 'Sugerido para vos',
      vehicles: [validVehicle],
    };
    expect(RecommendedVehiclesResponseSchema.parse(response)).toEqual(response);
  });

  it('parses valid response with empty vehicles', () => {
    const response = {
      section: '',
      vehicles: [],
    };
    expect(RecommendedVehiclesResponseSchema.parse(response)).toEqual(response);
  });

  it('rejects missing section', () => {
    const { section, ...withoutSection } = {
      section: 'Sugerido para vos',
      vehicles: [],
    };
    expect(RecommendedVehiclesResponseSchema.safeParse(withoutSection).success).toBe(false);
  });
});

describe('SearchAlternativeSchema', () => {
  it('parses a valid alternative', () => {
    const alt = {
      vehicle: validVehicle,
      differences: ['Cambia transmisión: solicitaba Manual, disponible Automático'],
    };
    expect(SearchAlternativeSchema.parse(alt)).toEqual(alt);
  });

  it('rejects missing differences', () => {
    const { differences, ...withoutDiff } = {
      vehicle: validVehicle,
      differences: [],
    };
    expect(SearchAlternativeSchema.safeParse(withoutDiff).success).toBe(false);
  });
});

describe('SearchAlternativesResponseSchema', () => {
  it('parses valid alternatives response', () => {
    const response = {
      alternatives: [
        {
          vehicle: validVehicle,
          differences: ['Precio superior (30% más que el máximo solicitado)'],
        },
      ],
    };
    expect(SearchAlternativesResponseSchema.parse(response)).toEqual(response);
  });
});
