import { describe, it, expect } from 'vitest';
import {
  ReservationStatusSchema,
  PaymentMethodSchema,
  CreateReservationRequestSchema,
  CreateReservationResponseSchema,
  ConfirmReservationPaymentRequestSchema,
  ConfirmReservationPaymentResponseSchema,
  GetReservationResponseSchema,
  ListMyReservationsResponseSchema,
  OwnerReservationSchema,
  OwnerReservationsListRequestSchema,
  OwnerReservationsListResponseSchema,
  ReservationConductorSummarySchema,
} from '../../src/reservation/reservation';

const validUuid = '018f8b3c-4d0e-7000-8000-000000000001';
const validUuid2 = '018f8b3c-4d0e-7000-8000-000000000002';
const validUuid3 = '018f8b3c-4d0e-7000-8000-000000000003';
const validUuid4 = '018f8b3c-4d0e-7000-8000-000000000004';

describe('ReservationStatusSchema', () => {
  it('accepts all valid statuses', () => {
    for (const s of [
      'pending_payment',
      'confirmed',
      'in_progress',
      'completed',
      'cancelled',
      'rejected',
      'expired',
    ]) {
      expect(ReservationStatusSchema.parse(s)).toBe(s);
    }
  });

  it('rejects unknown status', () => {
    expect(() => ReservationStatusSchema.parse('paid')).toThrow();
  });
});

describe('PaymentMethodSchema', () => {
  it('accepts the three mocked methods', () => {
    for (const m of ['credit_card', 'debit_card', 'bank_transfer']) {
      expect(PaymentMethodSchema.parse(m)).toBe(m);
    }
  });

  it('rejects unknown method', () => {
    expect(() => PaymentMethodSchema.parse('crypto')).toThrow();
  });
});

describe('CreateReservationRequestSchema', () => {
  const base = {
    vehicleId: validUuid,
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-03T10:00:00.000Z',
    contractAccepted: true as const,
  };

  it('parses a valid request', () => {
    const r = CreateReservationRequestSchema.parse(base);
    expect(r.vehicleId).toBe(validUuid);
  });

  it('accepts contractAccepted=false at the schema level (domain enforces the rule)', () => {
    const r = CreateReservationRequestSchema.parse({
      ...base,
      contractAccepted: false,
    });
    expect(r.contractAccepted).toBe(false);
  });

  it('rejects non-boolean contractAccepted', () => {
    expect(() =>
      CreateReservationRequestSchema.parse({
        ...base,
        contractAccepted: 'yes' as unknown as boolean,
      }),
    ).toThrow();
  });

  it('rejects endAt <= startAt', () => {
    expect(() =>
      CreateReservationRequestSchema.parse({
        ...base,
        endAt: base.startAt,
      }),
    ).toThrow();
    expect(() =>
      CreateReservationRequestSchema.parse({
        ...base,
        startAt: '2026-06-03T10:00:00.000Z',
        endAt: '2026-06-01T10:00:00.000Z',
      }),
    ).toThrow();
  });

  it('rejects non-uuid vehicleId', () => {
    expect(() =>
      CreateReservationRequestSchema.parse({ ...base, vehicleId: 'nope' }),
    ).toThrow();
  });

  it('rejects non-ISO datetime', () => {
    expect(() =>
      CreateReservationRequestSchema.parse({ ...base, startAt: '2026-06-01' }),
    ).toThrow();
  });
});

describe('CreateReservationResponseSchema', () => {
  it('parses a valid response', () => {
    const r = CreateReservationResponseSchema.parse({
      id: validUuid,
      status: 'pending_payment',
      holdExpiresAt: '2026-06-01T10:10:00.000Z',
      totalCents: 4800000,
      currency: 'ARS',
    });
    expect(r.status).toBe('pending_payment');
  });

  it('rejects negative totalCents', () => {
    expect(() =>
      CreateReservationResponseSchema.parse({
        id: validUuid,
        status: 'pending_payment',
        holdExpiresAt: '2026-06-01T10:10:00.000Z',
        totalCents: -1,
        currency: 'ARS',
      }),
    ).toThrow();
  });

  it('rejects status other than pending_payment', () => {
    expect(() =>
      CreateReservationResponseSchema.parse({
        id: validUuid,
        status: 'confirmed',
        holdExpiresAt: '2026-06-01T10:10:00.000Z',
        totalCents: 1,
        currency: 'ARS',
      }),
    ).toThrow();
  });
});

describe('ConfirmReservationPaymentRequestSchema', () => {
  it('parses valid method', () => {
    const r = ConfirmReservationPaymentRequestSchema.parse({
      paymentMethod: 'credit_card',
    });
    expect(r.paymentMethod).toBe('credit_card');
  });

  it('rejects missing method', () => {
    expect(() => ConfirmReservationPaymentRequestSchema.parse({})).toThrow();
  });
});

describe('ConfirmReservationPaymentResponseSchema', () => {
  it('parses a valid response', () => {
    const r = ConfirmReservationPaymentResponseSchema.parse({
      id: validUuid,
      status: 'confirmed',
      paidAt: '2026-06-01T10:05:00.000Z',
    });
    expect(r.status).toBe('confirmed');
  });
});

describe('GetReservationResponseSchema', () => {
  const valid = {
    id: validUuid,
    vehicleId: validUuid2,
    conductorId: validUuid3,
    rentadorId: validUuid4,
    status: 'pending_payment',
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-03T10:00:00.000Z',
    holdExpiresAt: '2026-06-01T10:10:00.000Z',
    totalCents: 4800000,
    currency: 'ARS',
    paymentMethod: null,
    contractAcceptedAt: '2026-06-01T10:00:00.000Z',
    paidAt: null,
    createdAt: '2026-06-01T10:00:00.000Z',
    updatedAt: '2026-06-01T10:00:00.000Z',
    vehicle: {
      id: validUuid2,
      brand: 'Ford',
      model: 'Ranger',
      year: 2023,
      photo: null,
    },
    rentador: {
      id: validUuid4,
      name: 'Alice',
      avatarUrl: null,
    },
  };

  it('parses a valid response', () => {
    const r = GetReservationResponseSchema.parse(valid);
    expect(r.id).toBe(validUuid);
  });

  it('rejects missing nested vehicle field', () => {
    const { vehicle: _v, ...rest } = valid;
    expect(() => GetReservationResponseSchema.parse(rest)).toThrow();
  });
});

describe('ListMyReservationsResponseSchema', () => {
  it('parses empty list', () => {
    const r = ListMyReservationsResponseSchema.parse({ items: [] });
    expect(r.items).toEqual([]);
  });

  it('rejects items not an array', () => {
    expect(() =>
      ListMyReservationsResponseSchema.parse({ items: 'no' }),
    ).toThrow();
  });
});

// --- US-46 ---

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
