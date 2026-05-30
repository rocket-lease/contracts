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
  VoucherSchema,
  VerifyVoucherResponseSchema,
  ConfirmPickupRequestSchema,
  ConfirmPickupResponseSchema,
  ConfirmReturnRequestSchema,
  ConfirmReturnResponseSchema,
  CancelReservationResponseSchema,
  ExtendReservationRequestSchema,
  ExtendReservationResponseSchema,
  ReservationChainItemSchema,
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

  it('parses a confirmed response with null hold', () => {
    const r = ApproveReservationResponseSchema.parse({
      id: validUuid,
      status: 'confirmed',
      holdExpiresAt: null,
    });
    expect(r.status).toBe('confirmed');
    expect(r.holdExpiresAt).toBeNull();
  });

  it('rejects an invalid status', () => {
    expect(() =>
      ApproveReservationResponseSchema.parse({
        id: validUuid,
        status: 'in_progress',
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
      voucherToken: validUuid2,
    });
    expect(r.status).toBe('confirmed');
    expect(r.voucherToken).toBe(validUuid2);
  });
});

describe('CancelReservationResponseSchema', () => {
  it('parses a response with refund and updated balance', () => {
    const r = CancelReservationResponseSchema.parse({
      id: validUuid,
      status: 'cancelled',
      refundCents: 240000,
      balanceInCents: 480000,
      currency: 'ARS',
    });

    expect(r.refundCents).toBe(240000);
    expect(r.balanceInCents).toBe(480000);
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
    depositPercentageSnapshot: null,
    basePriceCentsSnapshot: 1500000,
    cancellationPolicySnapshot: 'FLEXIBLE',
    maxKilometrageSnapshot: { type: 'UNLIMITED' },
    rentalTimeConstraintsSnapshot: {},
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
    expect(r.depositPercentageSnapshot).toBeNull();
    expect(r.basePriceCentsSnapshot).toBe(1500000);
  });

  it('parses reservation detail with reservation rule set in vehicle summary', () => {
    const r = GetReservationResponseSchema.parse({
      ...valid,
      vehicle: {
        ...valid.vehicle,
        reservationRuleSet: {
          id: validUuid,
          rentalorId: validUuid4,
          cancellationPolicy: 'FLEXIBLE',
          depositPercentage: 10,
          maxKilometrage: { type: 'LIMITED', value: 250 },
          rentalTimeConstraints: { minDays: 2, maxDays: 10 },
        },
      },
    });

    expect(r.vehicle.reservationRuleSet?.cancellationPolicy).toBe('FLEXIBLE');
  });

  it('rejects missing nested vehicle field', () => {
    const { vehicle: _v, ...rest } = valid;
    expect(() => GetReservationResponseSchema.parse(rest)).toThrow();
  });

  it('rejects missing snapshot fields (post US-49)', () => {
    const { basePriceCentsSnapshot: _b, ...rest } = valid;
    expect(() => GetReservationResponseSchema.parse(rest)).toThrow();
  });

  it('accepts a confirmed reservation with depositPercentageSnapshot set', () => {
    const r = GetReservationResponseSchema.parse({
      ...valid,
      status: 'confirmed',
      paidAt: '2026-06-01T10:05:00.000Z',
      depositPercentageSnapshot: 30,
    });
    expect(r.depositPercentageSnapshot).toBe(30);
  });
});

describe('VoucherSchema', () => {
  const validVoucher = {
    reservationId: validUuid,
    voucherToken: validUuid2,
    status: 'confirmed' as const,
    conductor: {
      id: validUuid3,
      name: 'Julian',
      avatarUrl: null,
    },
    vehicle: {
      id: validUuid4,
      brand: 'Toyota',
      model: 'Etios',
      year: 2020,
      photo: null,
    },
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-03T10:00:00.000Z',
    totalCents: 50000,
    currency: 'ARS' as const,
    paymentMethod: 'credit_card' as const,
    paidAt: '2026-06-01T10:05:00.000Z',
  };

  it('parses a valid voucher', () => {
    const r = VoucherSchema.parse(validVoucher);
    expect(r.reservationId).toBe(validUuid);
    expect(r.voucherToken).toBe(validUuid2);
  });

  it('rejects invalid uuid in voucherToken', () => {
    expect(() =>
      VoucherSchema.parse({
        ...validVoucher,
        voucherToken: 'invalid-uuid',
      }),
    ).toThrow();
  });
});

describe('ConfirmPickupRequestSchema', () => {
  it('parses a valid uuid', () => {
    const r = ConfirmPickupRequestSchema.parse({ voucherToken: validUuid });
    expect(r.voucherToken).toBe(validUuid);
  });

  it('rejects a non-uuid string', () => {
    expect(() => ConfirmPickupRequestSchema.parse({ voucherToken: 'not-a-uuid' })).toThrow();
  });

  it('rejects missing voucherToken', () => {
    expect(() => ConfirmPickupRequestSchema.parse({})).toThrow();
  });
});

describe('ConfirmPickupResponseSchema', () => {
  it('parses a valid response', () => {
    const r = ConfirmPickupResponseSchema.parse({
      reservationId: validUuid,
      status: 'in_progress',
      startedAt: '2026-06-01T10:00:00.000Z',
      returnQrToken: validUuid2,
    });
    expect(r.status).toBe('in_progress');
    expect(r.returnQrToken).toBe(validUuid2);
  });

  it('rejects wrong status literal', () => {
    expect(() =>
      ConfirmPickupResponseSchema.parse({
        reservationId: validUuid,
        status: 'confirmed',
        startedAt: '2026-06-01T10:00:00.000Z',
        returnQrToken: validUuid2,
      }),
    ).toThrow();
  });
});

describe('ConfirmReturnRequestSchema', () => {
  it('parses a valid uuid', () => {
    const r = ConfirmReturnRequestSchema.parse({ returnQrToken: validUuid });
    expect(r.returnQrToken).toBe(validUuid);
  });

  it('rejects a non-uuid string', () => {
    expect(() => ConfirmReturnRequestSchema.parse({ returnQrToken: 'not-a-uuid' })).toThrow();
  });

  it('rejects missing returnQrToken', () => {
    expect(() => ConfirmReturnRequestSchema.parse({})).toThrow();
  });
});

describe('ConfirmReturnResponseSchema', () => {
  it('parses a valid response', () => {
    const r = ConfirmReturnResponseSchema.parse({
      reservationId: validUuid,
      status: 'completed',
      completedAt: '2026-06-03T10:00:00.000Z',
    });
    expect(r.status).toBe('completed');
    expect(r.completedAt).toBe('2026-06-03T10:00:00.000Z');
  });

  it('rejects wrong status literal', () => {
    expect(() =>
      ConfirmReturnResponseSchema.parse({
        reservationId: validUuid,
        status: 'in_progress',
        completedAt: '2026-06-03T10:00:00.000Z',
      }),
    ).toThrow();
  });
});

describe('VerifyVoucherResponseSchema', () => {
  const validVerifyResponse = {
    reservationId: validUuid,
    status: 'confirmed' as const,
    conductor: {
      id: validUuid2,
      name: 'Julian',
      avatarUrl: null,
    },
    vehicle: {
      id: validUuid3,
      brand: 'Toyota',
      model: 'Etios',
      year: 2020,
      photo: null,
    },
    rentador: {
      id: validUuid4,
      name: 'Lucas',
      avatarUrl: null,
    },
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-03T10:00:00.000Z',
    totalCents: 50000,
    currency: 'ARS' as const,
    paymentMethod: 'credit_card' as const,
    paidAt: '2026-06-01T10:05:00.000Z',
    isValid: true,
  };

  it('parses a valid verify response', () => {
    const r = VerifyVoucherResponseSchema.parse(validVerifyResponse);
    expect(r.isValid).toBe(true);
    expect(r.reservationId).toBe(validUuid);
  });

  it('parses a verify response with isValid: false', () => {
    const r = VerifyVoucherResponseSchema.parse({
      ...validVerifyResponse,
      status: 'cancelled',
      isValid: false,
    });
    expect(r.isValid).toBe(false);
    expect(r.status).toBe('cancelled');
  });
});

describe('ExtendReservationRequestSchema', () => {
  it('parses a valid request', () => {
    const r = ExtendReservationRequestSchema.parse({
      newEndAt: '2026-06-05T10:00:00.000Z',
    });
    expect(r.newEndAt).toBe('2026-06-05T10:00:00.000Z');
  });

  it('rechaza newEndAt con formato invalido', () => {
    expect(() =>
      ExtendReservationRequestSchema.parse({ newEndAt: 'manana' }),
    ).toThrow();
  });

  it('rechaza body sin newEndAt', () => {
    expect(() => ExtendReservationRequestSchema.parse({})).toThrow();
  });
});

describe('ExtendReservationResponseSchema', () => {
  const base = {
    id: validUuid,
    parentReservationId: validUuid2,
    holdExpiresAt: '2026-06-01T10:10:00.000Z',
    totalCents: 25000,
    currency: 'ARS' as const,
    requiresApproval: false,
  };

  it('parses pending_payment (auto-accept)', () => {
    const r = ExtendReservationResponseSchema.parse({
      ...base,
      status: 'pending_payment',
    });
    expect(r.status).toBe('pending_payment');
    expect(r.requiresApproval).toBe(false);
  });

  it('parses pending_approval (requires approval)', () => {
    const r = ExtendReservationResponseSchema.parse({
      ...base,
      status: 'pending_approval',
      requiresApproval: true,
    });
    expect(r.status).toBe('pending_approval');
    expect(r.requiresApproval).toBe(true);
  });

  it('rechaza status confirmed', () => {
    expect(() =>
      ExtendReservationResponseSchema.parse({ ...base, status: 'confirmed' }),
    ).toThrow();
  });

  it('exige parentReservationId', () => {
    const { parentReservationId, ...rest } = base;
    void parentReservationId;
    expect(() =>
      ExtendReservationResponseSchema.parse({
        ...rest,
        status: 'pending_payment',
      }),
    ).toThrow();
  });
});

describe('ReservationChainItemSchema', () => {
  it('parses a chain item with parentReservationId null (root)', () => {
    const r = ReservationChainItemSchema.parse({
      id: validUuid,
      status: 'in_progress',
      startAt: '2026-06-01T10:00:00.000Z',
      endAt: '2026-06-03T10:00:00.000Z',
      totalCents: 50000,
      parentReservationId: null,
    });
    expect(r.parentReservationId).toBeNull();
  });

  it('parses a chain item with parentReservationId set (extension)', () => {
    const r = ReservationChainItemSchema.parse({
      id: validUuid2,
      status: 'confirmed',
      startAt: '2026-06-03T10:00:00.000Z',
      endAt: '2026-06-05T10:00:00.000Z',
      totalCents: 50000,
      parentReservationId: validUuid,
    });
    expect(r.parentReservationId).toBe(validUuid);
  });
});

describe('GetReservationResponseSchema (extension fields)', () => {
  const baseReservation = {
    id: validUuid,
    vehicleId: validUuid2,
    conductorId: validUuid3,
    rentadorId: validUuid4,
    status: 'in_progress' as const,
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-03T10:00:00.000Z',
    holdExpiresAt: null,
    totalCents: 50000,
    currency: 'ARS' as const,
    paymentMethod: 'credit_card' as const,
    walletProvider: null,
    contractAcceptedAt: '2026-05-30T12:00:00.000Z',
    paidAt: '2026-05-30T12:05:00.000Z',
    transferExpiresAt: null,
    transferCode: null,
    transferAlias: null,
    rejectionReason: null,
    depositPercentageSnapshot: null,
    basePriceCentsSnapshot: 25000,
    cancellationPolicySnapshot: 'FLEXIBLE' as const,
    maxKilometrageSnapshot: { type: 'UNLIMITED' as const, value: null },
    rentalTimeConstraintsSnapshot: { minDays: 1 },
    createdAt: '2026-05-30T12:00:00.000Z',
    updatedAt: '2026-05-30T12:05:00.000Z',
    vehicle: {
      id: validUuid2,
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      photo: null,
    },
    rentador: { id: validUuid4, name: 'Lucas', avatarUrl: null },
  };

  it('acepta parentReservationId y chain ausentes (reserva sin extensiones)', () => {
    const r = GetReservationResponseSchema.parse(baseReservation);
    expect(r.parentReservationId).toBeUndefined();
    expect(r.chain).toBeUndefined();
  });

  it('acepta parentReservationId null y chain con items', () => {
    const r = GetReservationResponseSchema.parse({
      ...baseReservation,
      parentReservationId: null,
      chain: [
        {
          id: validUuid,
          status: 'in_progress',
          startAt: '2026-06-01T10:00:00.000Z',
          endAt: '2026-06-03T10:00:00.000Z',
          totalCents: 50000,
          parentReservationId: null,
        },
        {
          id: '018f8b3c-4d0e-7000-8000-000000000005',
          status: 'confirmed',
          startAt: '2026-06-03T10:00:00.000Z',
          endAt: '2026-06-05T10:00:00.000Z',
          totalCents: 50000,
          parentReservationId: validUuid,
        },
      ],
    });
    expect(r.chain).toHaveLength(2);
  });
});


