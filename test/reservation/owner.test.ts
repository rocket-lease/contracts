import { describe, it, expect } from 'vitest';
import {
  OwnerReservationSchema,
  OwnerReservationsListRequestSchema,
  OwnerReservationsListResponseSchema,
  ReservationConductorSummarySchema,
} from '../../src/reservation/owner';

const validUuid = '018f8b3c-4d0e-7000-8000-000000000001';
const validUuid2 = '018f8b3c-4d0e-7000-8000-000000000002';
const validUuid3 = '018f8b3c-4d0e-7000-8000-000000000003';
const validUuid4 = '018f8b3c-4d0e-7000-8000-000000000004';

describe('ReservationConductorSummarySchema', () => {
  it('parses valid summary', () => {
    const r = ReservationConductorSummarySchema.parse({
      id: validUuid,
      name: 'Julian',
      avatarUrl: null,
    });
    expect(r.name).toBe('Julian');
  });

  it('accepts avatarUrl as string', () => {
    const r = ReservationConductorSummarySchema.parse({
      id: validUuid,
      name: 'Julian',
      avatarUrl: 'https://example.com/a.jpg',
    });
    expect(r.avatarUrl).toBe('https://example.com/a.jpg');
  });

  it('rejects missing name', () => {
    expect(() =>
      ReservationConductorSummarySchema.parse({ id: validUuid, avatarUrl: null }),
    ).toThrow();
  });
});

describe('OwnerReservationsListRequestSchema', () => {
  it('applies defaults when no params', () => {
    const r = OwnerReservationsListRequestSchema.parse({});
    expect(r.page).toBe(1);
    expect(r.pageSize).toBe(20);
    expect(r.status).toBeUndefined();
  });

  it('accepts status array, dates and explicit page', () => {
    const r = OwnerReservationsListRequestSchema.parse({
      status: ['pending_payment', 'confirmed'],
      from: '2026-05-01T00:00:00.000Z',
      to: '2026-05-31T23:59:59.000Z',
      page: 3,
      pageSize: 50,
    });
    expect(r.status).toEqual(['pending_payment', 'confirmed']);
    expect(r.page).toBe(3);
    expect(r.pageSize).toBe(50);
  });

  it('rejects page=0', () => {
    expect(() =>
      OwnerReservationsListRequestSchema.parse({ page: 0 }),
    ).toThrow();
  });

  it('rejects pageSize > 100', () => {
    expect(() =>
      OwnerReservationsListRequestSchema.parse({ pageSize: 101 }),
    ).toThrow();
  });

  it('rejects invalid status enum', () => {
    expect(() =>
      OwnerReservationsListRequestSchema.parse({ status: ['paid'] }),
    ).toThrow();
  });
});

describe('OwnerReservationSchema', () => {
  const valid = {
    id: validUuid,
    vehicleId: validUuid2,
    conductorId: validUuid3,
    rentadorId: validUuid4,
    status: 'confirmed',
    startAt: '2026-05-20T10:00:00.000Z',
    endAt: '2026-05-25T10:00:00.000Z',
    holdExpiresAt: null,
    totalCents: 50000,
    currency: 'ARS',
    paymentMethod: 'credit_card',
    paidAt: '2026-05-15T12:00:00.000Z',
    createdAt: '2026-05-15T11:00:00.000Z',
    updatedAt: '2026-05-15T12:00:00.000Z',
    vehicle: {
      id: validUuid2,
      brand: 'Toyota',
      model: 'Etios',
      year: 2020,
      photo: null,
    },
    conductor: {
      id: validUuid3,
      name: 'Julian',
      avatarUrl: null,
    },
  };

  it('parses a valid owner reservation', () => {
    const r = OwnerReservationSchema.parse(valid);
    expect(r.conductor.name).toBe('Julian');
  });

  it('accepts holdExpiresAt as ISO string (caso pending_payment)', () => {
    const r = OwnerReservationSchema.parse({
      ...valid,
      status: 'pending_payment',
      holdExpiresAt: '2026-05-15T10:10:00.000Z',
    });
    expect(r.holdExpiresAt).toBe('2026-05-15T10:10:00.000Z');
  });

  it('rejects missing conductor field', () => {
    const { conductor: _c, ...rest } = valid;
    expect(() => OwnerReservationSchema.parse(rest)).toThrow();
  });
});

describe('OwnerReservationsListResponseSchema', () => {
  it('parses empty list with pagination', () => {
    const r = OwnerReservationsListResponseSchema.parse({
      items: [],
      page: 1,
      pageSize: 20,
      total: 0,
    });
    expect(r.items).toEqual([]);
    expect(r.total).toBe(0);
  });

  it('rejects negative total', () => {
    expect(() =>
      OwnerReservationsListResponseSchema.parse({
        items: [],
        page: 1,
        pageSize: 20,
        total: -1,
      }),
    ).toThrow();
  });
});
