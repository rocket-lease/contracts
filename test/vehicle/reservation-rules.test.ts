import { describe, it, expect } from 'vitest';
import {
  CancellationPolicySchema,
  DepositPercentageSchema,
  MaxKilometrageSchema,
  RentalTimeConstraintsSchema,
  ReservationRuleSetSchema,
  ReservationRuleSetPublicSchema,
  CreateReservationRuleSetRequestSchema,
  UpdateReservationRuleSetRequestSchema,
  ReservationRuleSetListResponseSchema,
  ReservationRuleSetEndpoints,
} from '../../src/vehicle/reservation-rules';

const validUuid = '018f8b3c-4d0e-7000-8000-000000000001';
const otherUuid = '018f8b3c-4d0e-7000-8000-000000000002';

const validRuleSet = {
  id: validUuid,
  rentalorId: otherUuid,
  vehicleId: null,
  name: 'Flexible',
  description: 'Política flexible para autos de uso recreativo',
  cancellationPolicy: 'FLEXIBLE' as const,
  depositPercentage: null,
  maxKilometrage: { type: 'UNLIMITED' as const },
  rentalTimeConstraints: {},
  vehicleCount: 0,
  createdAt: '2026-05-20T10:00:00.000Z',
  updatedAt: '2026-05-20T10:00:00.000Z',
};

describe('CancellationPolicySchema', () => {
  it('accepts FLEXIBLE, MODERATE, STRICT', () => {
    for (const p of ['FLEXIBLE', 'MODERATE', 'STRICT']) {
      expect(CancellationPolicySchema.parse(p)).toBe(p);
    }
  });

  it('rejects unknown policy', () => {
    expect(() => CancellationPolicySchema.parse('LIBRE')).toThrow();
  });
});

describe('DepositPercentageSchema', () => {
  it('accepts null (no seña)', () => {
    expect(DepositPercentageSchema.parse(null)).toBeNull();
  });

  it('accepts integer values in [10, 50]', () => {
    for (const v of [10, 11, 20, 30, 49, 50]) {
      expect(DepositPercentageSchema.parse(v)).toBe(v);
    }
  });

  it('rejects below minimum', () => {
    for (const v of [0, 1, 9, -1, -50]) {
      expect(() => DepositPercentageSchema.parse(v)).toThrow();
    }
  });

  it('rejects above maximum', () => {
    for (const v of [51, 60, 100, 1000]) {
      expect(() => DepositPercentageSchema.parse(v)).toThrow();
    }
  });

  it('rejects non-integer values', () => {
    for (const v of [10.5, 20.1, 50.0001]) {
      expect(() => DepositPercentageSchema.parse(v)).toThrow();
    }
  });

  it('rejects non-numeric values', () => {
    expect(() => DepositPercentageSchema.parse('30')).toThrow();
    expect(() => DepositPercentageSchema.parse('null')).toThrow();
    expect(() => DepositPercentageSchema.parse(undefined)).toThrow();
    expect(() => DepositPercentageSchema.parse({})).toThrow();
  });
});

describe('MaxKilometrageSchema', () => {
  it('accepts UNLIMITED', () => {
    const r = MaxKilometrageSchema.parse({ type: 'UNLIMITED' });
    expect(r).toEqual({ type: 'UNLIMITED' });
  });

  it('accepts LIMITED with positive value', () => {
    const r = MaxKilometrageSchema.parse({ type: 'LIMITED', value: 250 });
    expect(r).toEqual({ type: 'LIMITED', value: 250 });
  });

  it('rejects LIMITED with non-positive value', () => {
    expect(() => MaxKilometrageSchema.parse({ type: 'LIMITED', value: 0 })).toThrow();
    expect(() => MaxKilometrageSchema.parse({ type: 'LIMITED', value: -10 })).toThrow();
  });
});

describe('RentalTimeConstraintsSchema', () => {
  it('accepts empty object', () => {
    expect(RentalTimeConstraintsSchema.parse({})).toEqual({});
  });

  it('accepts only minDays', () => {
    expect(RentalTimeConstraintsSchema.parse({ minDays: 1 })).toEqual({ minDays: 1 });
  });

  it('accepts minDays <= maxDays', () => {
    expect(RentalTimeConstraintsSchema.parse({ minDays: 1, maxDays: 14 })).toEqual({
      minDays: 1,
      maxDays: 14,
    });
  });

  it('rejects minDays > maxDays', () => {
    expect(() =>
      RentalTimeConstraintsSchema.parse({ minDays: 10, maxDays: 5 }),
    ).toThrow();
  });
});

describe('ReservationRuleSetSchema', () => {
  it('parses a valid shared rule set (vehicleId=null)', () => {
    const r = ReservationRuleSetSchema.parse(validRuleSet);
    expect(r.vehicleId).toBeNull();
    expect(r.depositPercentage).toBeNull();
  });

  it('parses a private rule set (vehicleId=uuid)', () => {
    const r = ReservationRuleSetSchema.parse({
      ...validRuleSet,
      vehicleId: otherUuid,
      depositPercentage: 30,
    });
    expect(r.vehicleId).toBe(otherUuid);
    expect(r.depositPercentage).toBe(30);
  });

  it('rejects missing vehicleId field', () => {
    const { vehicleId: _v, ...rest } = validRuleSet;
    expect(() => ReservationRuleSetSchema.parse(rest)).toThrow();
  });

  it('rejects vehicleId as empty string', () => {
    expect(() =>
      ReservationRuleSetSchema.parse({ ...validRuleSet, vehicleId: '' }),
    ).toThrow();
  });

  it('rejects vehicleId as non-uuid string', () => {
    expect(() =>
      ReservationRuleSetSchema.parse({ ...validRuleSet, vehicleId: 'not-a-uuid' }),
    ).toThrow();
  });

  it('rejects depositPercentage out of range', () => {
    expect(() =>
      ReservationRuleSetSchema.parse({ ...validRuleSet, depositPercentage: 5 }),
    ).toThrow();
    expect(() =>
      ReservationRuleSetSchema.parse({ ...validRuleSet, depositPercentage: 51 }),
    ).toThrow();
  });
});

describe('ReservationRuleSetPublicSchema', () => {
  it('omits vehicleId, name, description, vehicleCount, timestamps', () => {
    const r = ReservationRuleSetPublicSchema.parse(validRuleSet);
    expect('vehicleId' in r).toBe(false);
    expect('name' in r).toBe(false);
    expect('description' in r).toBe(false);
    expect('vehicleCount' in r).toBe(false);
    expect('createdAt' in r).toBe(false);
    expect('updatedAt' in r).toBe(false);
    expect(r.id).toBe(validUuid);
    expect(r.depositPercentage).toBeNull();
  });
});

describe('CreateReservationRuleSetRequestSchema', () => {
  const validCreate = {
    vehicleId: null,
    name: 'Premium',
    description: 'Para autos premium',
    cancellationPolicy: 'STRICT',
    depositPercentage: 50,
    maxKilometrage: { type: 'LIMITED', value: 250 },
    rentalTimeConstraints: { minDays: 2, maxDays: 14 },
  };

  it('parses a valid shared create request', () => {
    const r = CreateReservationRuleSetRequestSchema.parse(validCreate);
    expect(r.vehicleId).toBeNull();
    expect(r.depositPercentage).toBe(50);
  });

  it('parses a valid private create request (vehicleId=uuid)', () => {
    const r = CreateReservationRuleSetRequestSchema.parse({
      ...validCreate,
      vehicleId: otherUuid,
    });
    expect(r.vehicleId).toBe(otherUuid);
  });

  it('rejects when vehicleId is missing', () => {
    const { vehicleId: _v, ...rest } = validCreate;
    expect(() => CreateReservationRuleSetRequestSchema.parse(rest)).toThrow();
  });

  it('rejects when depositPercentage is out of range', () => {
    expect(() =>
      CreateReservationRuleSetRequestSchema.parse({
        ...validCreate,
        depositPercentage: 8,
      }),
    ).toThrow();
  });
});

describe('UpdateReservationRuleSetRequestSchema', () => {
  it('parses an empty partial update', () => {
    expect(UpdateReservationRuleSetRequestSchema.parse({})).toEqual({});
  });

  it('parses a partial update with depositPercentage', () => {
    const r = UpdateReservationRuleSetRequestSchema.parse({ depositPercentage: 20 });
    expect(r.depositPercentage).toBe(20);
  });

  it('strips vehicleId silently (Zod default behavior)', () => {
    const parsed = UpdateReservationRuleSetRequestSchema.parse({
      vehicleId: otherUuid,
      depositPercentage: 30,
    });
    expect('vehicleId' in parsed).toBe(false);
    expect(parsed.depositPercentage).toBe(30);
  });
});

describe('ReservationRuleSetListResponseSchema', () => {
  it('parses a valid list item with null deposit', () => {
    const r = ReservationRuleSetListResponseSchema.parse({
      id: validUuid,
      name: 'Flexible',
      cancellationPolicy: 'FLEXIBLE',
      depositPercentage: null,
      vehicleCount: 3,
      createdAt: '2026-05-20T10:00:00.000Z',
    });
    expect(r.depositPercentage).toBeNull();
    expect(r.vehicleCount).toBe(3);
  });

  it('defaults vehicleCount to 0 when omitted', () => {
    const r = ReservationRuleSetListResponseSchema.parse({
      id: validUuid,
      name: 'Flexible',
      cancellationPolicy: 'FLEXIBLE',
      depositPercentage: 30,
      createdAt: '2026-05-20T10:00:00.000Z',
    });
    expect(r.vehicleCount).toBe(0);
  });
});

describe('ReservationRuleSetEndpoints', () => {
  it('builds the private-by-vehicle path', () => {
    expect(ReservationRuleSetEndpoints.getPrivateByVehicle(validUuid)).toBe(
      `/vehicle/${validUuid}/private-rule-set`,
    );
  });

  it('listMine path is /reservation-rules', () => {
    expect(ReservationRuleSetEndpoints.listMine).toBe('/reservation-rules');
  });
});
