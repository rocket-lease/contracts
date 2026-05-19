import { describe, it, expect } from 'vitest';
import {
  ReservationStatusSchema,
  PaymentMethodSchema,
  CreateReservationRequestSchema,
  CreateReservationResponseSchema,
  ConfirmReservationPaymentRequestSchema,
  ConfirmReservationPaymentResponseSchema,
  GetReservationResponseSchema,
  ApproveReservationResponseSchema,
  RejectReservationRequestSchema,
  RejectReservationResponseSchema,
} from '../../src/reservation/reservation';

const validUuid = '018f8b3c-4d0e-7000-8000-000000000001';
const validUuid2 = '018f8b3c-4d0e-7000-8000-000000000002';
const validUuid3 = '018f8b3c-4d0e-7000-8000-000000000003';
const validUuid4 = '018f8b3c-4d0e-7000-8000-000000000004';

describe('ReservationStatusSchema', () => {
  it('accepts all valid statuses', () => {
    for (const s of [
      'pending_approval',
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

  it('accepts pending_approval as status (auto_accept off)', () => {
    const r = CreateReservationResponseSchema.parse({
      id: validUuid,
      status: 'pending_approval',
      holdExpiresAt: '2026-06-02T10:00:00.000Z',
      totalCents: 4800000,
      currency: 'ARS',
    });
    expect(r.status).toBe('pending_approval');
  });

  it('rejects status outside the allowed union', () => {
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

describe('ApproveReservationResponseSchema', () => {
  it('parses a valid response', () => {
    const r = ApproveReservationResponseSchema.parse({
      id: validUuid,
      status: 'pending_payment',
      holdExpiresAt: '2026-06-01T10:10:00.000Z',
    });
    expect(r.status).toBe('pending_payment');
  });

  it('rejects wrong status literal', () => {
    expect(() =>
      ApproveReservationResponseSchema.parse({
        id: validUuid,
        status: 'confirmed',
        holdExpiresAt: '2026-06-01T10:10:00.000Z',
      }),
    ).toThrow();
  });
});

describe('RejectReservationRequestSchema', () => {
  it('parses without reason', () => {
    const r = RejectReservationRequestSchema.parse({});
    expect(r.reason).toBeUndefined();
  });

  it('parses with reason under 280 chars', () => {
    const r = RejectReservationRequestSchema.parse({ reason: 'No disponible' });
    expect(r.reason).toBe('No disponible');
  });

  it('rejects reason over 280 chars', () => {
    expect(() =>
      RejectReservationRequestSchema.parse({ reason: 'x'.repeat(281) }),
    ).toThrow();
  });

  it('trims surrounding whitespace', () => {
    const r = RejectReservationRequestSchema.parse({ reason: '  motivo  ' });
    expect(r.reason).toBe('motivo');
  });
});

describe('RejectReservationResponseSchema', () => {
  it('parses with rejectionReason null', () => {
    const r = RejectReservationResponseSchema.parse({
      id: validUuid,
      status: 'rejected',
      rejectionReason: null,
    });
    expect(r.status).toBe('rejected');
    expect(r.rejectionReason).toBeNull();
  });

  it('parses with rejectionReason set', () => {
    const r = RejectReservationResponseSchema.parse({
      id: validUuid,
      status: 'rejected',
      rejectionReason: 'En mantenimiento',
    });
    expect(r.rejectionReason).toBe('En mantenimiento');
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
    walletProvider: null,
    transferExpiresAt: null,
    transferCode: null,
    transferAlias: null,
    contractAcceptedAt: '2026-06-01T10:00:00.000Z',
    paidAt: null,
    rejectionReason: null,
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


