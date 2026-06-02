import { describe, it, expect } from 'vitest';
import {
  ReservationListItemSchema,
  ReservationRoleSchema,
  ReservationsListRequestSchema,
  ReservationsListResponseSchema,
} from '../../src/reservation/list';
import { UserPublicSummarySchema } from '../../src/profile/profile';

const validUuid = '018f8b3c-4d0e-7000-8000-000000000001';
const validUuid2 = '018f8b3c-4d0e-7000-8000-000000000002';
const validUuid3 = '018f8b3c-4d0e-7000-8000-000000000003';
const validUuid4 = '018f8b3c-4d0e-7000-8000-000000000004';

describe('ReservationRoleSchema', () => {
  it('acepta "conductor" y "owner"', () => {
    expect(ReservationRoleSchema.parse('conductor')).toBe('conductor');
    expect(ReservationRoleSchema.parse('owner')).toBe('owner');
  });
  it('rechaza otros valores', () => {
    expect(() => ReservationRoleSchema.parse('rentador')).toThrow();
    expect(() => ReservationRoleSchema.parse('admin')).toThrow();
  });
});

describe('UserPublicSummarySchema (conductor/rentador embebido)', () => {
  it('parses valid summary', () => {
    const r = UserPublicSummarySchema.parse({
      id: validUuid,
      name: 'Julian',
      avatarUrl: null,
    });
    expect(r.name).toBe('Julian');
  });

  it('rejects missing name', () => {
    expect(() =>
      UserPublicSummarySchema.parse({ id: validUuid, avatarUrl: null }),
    ).toThrow();
  });
});

describe('ReservationsListRequestSchema', () => {
  it('exige role', () => {
    expect(() => ReservationsListRequestSchema.parse({})).toThrow();
  });

  it('aplica defaults page=1 y pageSize=20 cuando solo viene role', () => {
    const r = ReservationsListRequestSchema.parse({ role: 'owner' });
    expect(r.page).toBe(1);
    expect(r.pageSize).toBe(20);
    expect(r.status).toBeUndefined();
  });

  it('acepta status array, dates y paginación explícitas', () => {
    const r = ReservationsListRequestSchema.parse({
      role: 'conductor',
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

  it('rechaza page=0 y pageSize > 100', () => {
    expect(() =>
      ReservationsListRequestSchema.parse({ role: 'owner', page: 0 }),
    ).toThrow();
    expect(() =>
      ReservationsListRequestSchema.parse({ role: 'owner', pageSize: 101 }),
    ).toThrow();
  });
});

describe('ReservationListItemSchema', () => {
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
    rejectionReason: null,
    createdAt: '2026-05-15T11:00:00.000Z',
    updatedAt: '2026-05-15T12:00:00.000Z',
    vehicle: {
      id: validUuid2,
      plate: 'AB123CD',
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
    rentador: {
      id: validUuid4,
      name: 'Lucas',
      avatarUrl: null,
    },
  };

  it('parses a valid list item con conductor y rentador embebidos', () => {
    const r = ReservationListItemSchema.parse(valid);
    expect(r.conductor.name).toBe('Julian');
    expect(r.rentador.name).toBe('Lucas');
  });

  it('acepta holdExpiresAt como ISO string (caso pending_payment)', () => {
    const r = ReservationListItemSchema.parse({
      ...valid,
      status: 'pending_payment',
      holdExpiresAt: '2026-05-15T10:10:00.000Z',
    });
    expect(r.holdExpiresAt).toBe('2026-05-15T10:10:00.000Z');
  });

  it('rejects missing rentador', () => {
    const { rentador: _r, ...rest } = valid;
    expect(() => ReservationListItemSchema.parse(rest)).toThrow();
  });

  it('rejects missing conductor', () => {
    const { conductor: _c, ...rest } = valid;
    expect(() => ReservationListItemSchema.parse(rest)).toThrow();
  });

  it('acepta parentReservationId opcional (extension)', () => {
    const r = ReservationListItemSchema.parse({
      ...valid,
      parentReservationId: validUuid,
    });
    expect(r.parentReservationId).toBe(validUuid);
  });

  it('acepta parentReservationId omitido (reserva root)', () => {
    const r = ReservationListItemSchema.parse(valid);
    expect(r.parentReservationId).toBeUndefined();
  });

  it('parses a list item with cancellation fields', () => {
    const r = ReservationListItemSchema.parse({
      ...valid,
      status: 'cancelled',
      cancelledAt: '2026-05-18T10:00:00.000Z',
      cancelledBy: 'conductor',
      cancellationReason: 'Cambio de planes',
    });
    expect(r.cancelledAt).toBe('2026-05-18T10:00:00.000Z');
    expect(r.cancelledBy).toBe('conductor');
    expect(r.cancellationReason).toBe('Cambio de planes');
  });

  it('parses a non-cancelled item without cancellation fields', () => {
    const r = ReservationListItemSchema.parse(valid);
    expect(r.cancelledAt).toBeUndefined();
    expect(r.cancelledBy).toBeUndefined();
    expect(r.cancellationReason).toBeUndefined();
  });
});

describe('ReservationsListResponseSchema', () => {
  it('parses empty list con paginación', () => {
    const r = ReservationsListResponseSchema.parse({
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
      ReservationsListResponseSchema.parse({
        items: [],
        page: 1,
        pageSize: 20,
        total: -1,
      }),
    ).toThrow();
  });
});
