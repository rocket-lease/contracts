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
  CancelReservationRequestSchema,
  CancelReservationResponseSchema,
  ExtendReservationRequestSchema,
  ExtendReservationResponseSchema,
  ReservationChainItemSchema,
  ReservationAddressSchema,
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
  it('parses a valid full-payment response', () => {
    const r = ConfirmReservationPaymentResponseSchema.parse({
      id: validUuid,
      status: 'confirmed',
      paidAt: '2026-06-01T10:05:00.000Z',
      voucherToken: validUuid2,
      paidCents: 48000,
      balanceCents: 0,
      balanceDueAt: null,
    });
    expect(r.status).toBe('confirmed');
    expect(r.voucherToken).toBe(validUuid2);
    expect(r.balanceCents).toBe(0);
  });

  it('parses a deposit response (US-26) with pending_balance', () => {
    const r = ConfirmReservationPaymentResponseSchema.parse({
      id: validUuid,
      status: 'pending_balance',
      paidAt: '2026-06-01T10:05:00.000Z',
      voucherToken: null,
      paidCents: 14400,
      balanceCents: 33600,
      balanceDueAt: '2026-06-05T10:05:00.000Z',
    });
    expect(r.status).toBe('pending_balance');
    expect(r.voucherToken).toBeNull();
    expect(r.balanceCents).toBe(33600);
  });
});

describe('CancelReservationRequestSchema', () => {
  it('parses without reason', () => {
    const r = CancelReservationRequestSchema.parse({});
    expect(r.reason).toBeUndefined();
  });

  it('parses with reason under 280 chars', () => {
    const r = CancelReservationRequestSchema.parse({ reason: 'Tuve un inconveniente' });
    expect(r.reason).toBe('Tuve un inconveniente');
  });

  it('rejects reason over 280 chars', () => {
    expect(() => CancelReservationRequestSchema.parse({ reason: 'x'.repeat(281) })).toThrow();
  });

  it('trims surrounding whitespace', () => {
    const r = CancelReservationRequestSchema.parse({ reason: '  motivo  ' });
    expect(r.reason).toBe('motivo');
  });
});

describe('CancelReservationResponseSchema', () => {
  it('parses with cancelledBy owner and reputationPenalty', () => {
    const r = CancelReservationResponseSchema.parse({
      id: validUuid,
      status: 'cancelled',
      cancelledBy: 'owner',
      refundCents: 240000,
      reputationPenalty: -15,
      balanceInCents: 480000,
      currency: 'ARS',
    });

    expect(r.cancelledBy).toBe('owner');
    expect(r.reputationPenalty).toBe(-15);
    expect(r.refundCents).toBe(240000);
    expect(r.balanceInCents).toBe(480000);
  });

  it('parses with cancelledBy conductor and no reputationPenalty', () => {
    const r = CancelReservationResponseSchema.parse({
      id: validUuid,
      status: 'cancelled',
      cancelledBy: 'conductor',
      refundCents: 120000,
      reputationPenalty: 0,
      balanceInCents: 480000,
      currency: 'ARS',
    });

    expect(r.cancelledBy).toBe('conductor');
    expect(r.reputationPenalty).toBe(0);
  });

  it('rejects positive reputationPenalty', () => {
    expect(() =>
      CancelReservationResponseSchema.parse({
        id: validUuid,
        status: 'cancelled',
        cancelledBy: 'owner',
        refundCents: 240000,
        reputationPenalty: 15,
        balanceInCents: 480000,
        currency: 'ARS',
      })
    ).toThrow();
  });

  it('rejects invalid cancelledBy', () => {
    expect(() =>
      CancelReservationResponseSchema.parse({
        id: validUuid,
        status: 'cancelled',
        cancelledBy: 'admin',
        refundCents: 240000,
        reputationPenalty: 0,
        balanceInCents: 480000,
        currency: 'ARS',
      })
    ).toThrow();
  });

  it('rejects negative refundCents', () => {
    expect(() =>
      CancelReservationResponseSchema.parse({
        id: validUuid,
        status: 'cancelled',
        cancelledBy: 'conductor',
        refundCents: -100,
        reputationPenalty: 0,
        balanceInCents: 480000,
        currency: 'ARS',
      })
    ).toThrow();
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
      plate: 'AB123CD',
      brand: 'Ford',
      model: 'Ranger',
      year: 2020,
      photo: null,
    },
    rentador: { id: validUuid4, name: 'Lucas', avatarUrl: null },
    withHomeDelivery: false,
    homeDeliveryFeeCentsSnapshot: null,
    deliveryAddress: null,
    withHomeReturn: false,
    homeReturnFeeCentsSnapshot: null,
    returnAddress: null,
  };

  it('acepta parentReservationId y chain ausentes (reserva sin extensiones)', () => {
    const r = GetReservationResponseSchema.parse(valid);
    expect(r.parentReservationId).toBeUndefined();
    expect(r.chain).toBeUndefined();
  });

  it('acepta parentReservationId null y chain con items', () => {
    const r = GetReservationResponseSchema.parse({
      ...valid,
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

describe('ReservationAddressSchema', () => {
  const validAddress = {
    address: 'Av. Corrientes 1234, CABA',
    latitude: -34.6037,
    longitude: -58.3816,
  };

  it('parses a valid address', () => {
    const r = ReservationAddressSchema.parse(validAddress);
    expect(r.address).toBe('Av. Corrientes 1234, CABA');
    expect(r.latitude).toBe(-34.6037);
  });

  it('rejects empty address string', () => {
    expect(() => ReservationAddressSchema.parse({ ...validAddress, address: '' })).toThrow();
  });

  it('rejects latitude out of range', () => {
    expect(() => ReservationAddressSchema.parse({ ...validAddress, latitude: 91 })).toThrow();
    expect(() => ReservationAddressSchema.parse({ ...validAddress, latitude: -91 })).toThrow();
  });

  it('rejects longitude out of range', () => {
    expect(() => ReservationAddressSchema.parse({ ...validAddress, longitude: 181 })).toThrow();
    expect(() => ReservationAddressSchema.parse({ ...validAddress, longitude: -181 })).toThrow();
  });

  it('rejects missing fields', () => {
    expect(() => ReservationAddressSchema.parse({ latitude: -34.6, longitude: -58.3 })).toThrow();
  });
});

describe('CreateReservationRequestSchema — home delivery fields', () => {
  const base = {
    vehicleId: validUuid,
    startAt: '2026-06-01T10:00:00.000Z',
    endAt: '2026-06-03T10:00:00.000Z',
    contractAccepted: true,
  };
  const validAddr = { address: 'Av. Corrientes 1234', latitude: -34.6037, longitude: -58.3816 };

  it('defaults withHomeDelivery and withHomeReturn to false', () => {
    const r = CreateReservationRequestSchema.parse(base);
    expect(r.withHomeDelivery).toBe(false);
    expect(r.withHomeReturn).toBe(false);
    expect(r.deliveryAddress).toBeUndefined();
    expect(r.returnAddress).toBeUndefined();
  });

  it('accepts withHomeDelivery=true with a valid delivery address', () => {
    const r = CreateReservationRequestSchema.parse({
      ...base,
      withHomeDelivery: true,
      deliveryAddress: validAddr,
    });
    expect(r.withHomeDelivery).toBe(true);
    expect(r.deliveryAddress?.address).toBe('Av. Corrientes 1234');
  });

  it('accepts withHomeReturn=true with a valid return address', () => {
    const r = CreateReservationRequestSchema.parse({
      ...base,
      withHomeReturn: true,
      returnAddress: validAddr,
    });
    expect(r.withHomeReturn).toBe(true);
    expect(r.returnAddress?.latitude).toBe(-34.6037);
  });

  it('accepts both delivery and return with different addresses', () => {
    const returnAddr = { address: 'Corrientes 9999', latitude: -34.61, longitude: -58.39 };
    const r = CreateReservationRequestSchema.parse({
      ...base,
      withHomeDelivery: true,
      deliveryAddress: validAddr,
      withHomeReturn: true,
      returnAddress: returnAddr,
    });
    expect(r.withHomeDelivery).toBe(true);
    expect(r.withHomeReturn).toBe(true);
    expect(r.deliveryAddress?.address).not.toBe(r.returnAddress?.address);
  });

  it('rejects invalid deliveryAddress (bad latitude)', () => {
    expect(() =>
      CreateReservationRequestSchema.parse({
        ...base,
        withHomeDelivery: true,
        deliveryAddress: { address: 'Somewhere', latitude: 999, longitude: -58 },
      }),
    ).toThrow();
  });
});


