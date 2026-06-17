import { describe, expect, it } from 'vitest';
import {
  BenefitInfoSchema,
  ExperienceTransactionSchema,
  LevelUpInfoSchema,
  LoyaltyProfileSchema,
} from '../../src/loyalty/loyalty';
import { CreateReviewResponseSchema } from '../../src/schemas/review.schema';
import { PricingQuoteSchema } from '../../src/pricing/pricing';

const validUuid = '018f8b3c-4d0e-7000-8000-000000000001';

describe('LoyaltyProfileSchema', () => {
  it('parses a valid loyalty profile', () => {
    const profile = LoyaltyProfileSchema.parse({
      conductorId: validUuid,
      level: 'gold',
      totalXp: 2500,
      pendingXp: 150,
      xpForNextLevel: 5000,
      progress: 50,
      benefits: [
        { type: 'discount', description: '10% off', config: { percentage: 10 } },
      ],
    });

    expect(profile.conductorId).toBe(validUuid);
    expect(profile.level).toBe('gold');
  });

  it('rejects invalid conductorId', () => {
    expect(() =>
      LoyaltyProfileSchema.parse({
        conductorId: 'not-a-uuid',
        level: 'gold',
        totalXp: 2500,
        pendingXp: 150,
        xpForNextLevel: 5000,
        progress: 50,
        benefits: [],
      }),
    ).toThrow();
  });

  it('rejects invalid level', () => {
    expect(() =>
      LoyaltyProfileSchema.parse({
        conductorId: validUuid,
        level: 'diamond',
        totalXp: 2500,
        pendingXp: 150,
        xpForNextLevel: 5000,
        progress: 50,
        benefits: [],
      }),
    ).toThrow();
  });
});

const validReservation = {
  id: validUuid,
  vehicleName: 'Toyota Corolla',
  vehicleId: validUuid,
  startAt: '2026-06-01T10:00:00.000Z',
  endAt: '2026-06-08T10:00:00.000Z',
};

describe('ExperienceTransactionSchema', () => {
  it('parses a valid transaction with reservation', () => {
    const tx = ExperienceTransactionSchema.parse({
      id: validUuid,
      amount: 100,
      status: 'pending',
      createdAt: '2026-06-01T10:00:00.000Z',
      reservation: validReservation,
    });

    expect(tx.amount).toBe(100);
    expect(tx.status).toBe('pending');
    expect(tx.reservation.vehicleName).toBe('Toyota Corolla');
  });

  it('parses a transaction with status pending', () => {
    const tx = ExperienceTransactionSchema.parse({
      id: validUuid,
      amount: 100,
      status: 'pending',
      createdAt: '2026-06-01T10:00:00.000Z',
      reservation: validReservation,
    });

    expect(tx.status).toBe('pending');
  });

  it('parses a transaction with status claimed', () => {
    const tx = ExperienceTransactionSchema.parse({
      id: validUuid,
      amount: 100,
      status: 'claimed',
      createdAt: '2026-06-01T10:00:00.000Z',
      reservation: validReservation,
    });

    expect(tx.status).toBe('claimed');
  });

  it('strips extra fields like source and description', () => {
    const tx = ExperienceTransactionSchema.parse({
      id: validUuid,
      amount: 100,
      status: 'pending',
      createdAt: '2026-06-01T10:00:00.000Z',
      reservation: validReservation,
      source: 'review',
      description: 'old field',
    });

    expect(tx).not.toHaveProperty('source');
    expect(tx).not.toHaveProperty('description');
  });

  it('rejects invalid status', () => {
    expect(() =>
      ExperienceTransactionSchema.parse({
        id: validUuid,
        amount: 100,
        status: 'expired',
        createdAt: '2026-06-01T10:00:00.000Z',
        reservation: validReservation,
      }),
    ).toThrow();
  });

  it('rejects missing reservation', () => {
    expect(() =>
      ExperienceTransactionSchema.parse({
        id: validUuid,
        amount: 100,
        status: 'pending',
        createdAt: '2026-06-01T10:00:00.000Z',
      }),
    ).toThrow();
  });
});

describe('LevelUpInfoSchema', () => {
  it('parses a complete level-up', () => {
    const info = LevelUpInfoSchema.parse({
      oldLevel: 'silver',
      newLevel: 'gold',
      benefits: [
        { type: 'discount', description: '15% off', config: null },
      ],
    });

    expect(info.oldLevel).toBe('silver');
    expect(info.newLevel).toBe('gold');
  });

  it('rejects invalid oldLevel', () => {
    expect(() =>
      LevelUpInfoSchema.parse({
        oldLevel: 'diamond',
        newLevel: 'gold',
        benefits: [],
      }),
    ).toThrow();
  });
});

describe('BenefitInfoSchema', () => {
  it('parses with config null', () => {
    const benefit = BenefitInfoSchema.parse({
      type: 'priority_support',
      description: 'Priority customer support',
      config: null,
    });

    expect(benefit.config).toBeNull();
  });
});

describe('CreateReviewResponseSchema — levelUp extension', () => {
  it('parses with levelUp', () => {
    const response = CreateReviewResponseSchema.parse({
      id: validUuid,
      reservationId: validUuid,
      reviewerId: validUuid,
      reviewerName: 'Juan',
      targetType: 'vehicle',
      rating: 5,
      vehicleRating: 4,
      comment: 'Great car',
      createdAt: '2026-06-01T10:00:00.000Z',
      levelUp: {
        oldLevel: 'silver',
        newLevel: 'gold',
        benefits: [{ type: 'discount', description: '15% off', config: null }],
      },
    });

    expect(response.levelUp).not.toBeNull();
    expect(response.levelUp!.newLevel).toBe('gold');
  });

  it('parses without levelUp (null)', () => {
    const response = CreateReviewResponseSchema.parse({
      id: validUuid,
      reservationId: validUuid,
      reviewerId: validUuid,
      reviewerName: 'Juan',
      targetType: 'vehicle',
      rating: 4,
      vehicleRating: null,
      comment: 'Good experience',
      createdAt: '2026-06-01T10:00:00.000Z',
      levelUp: null,
    });

    expect(response.levelUp).toBeNull();
  });
});

describe('PricingQuoteSchema — levelDiscountPercentage extension', () => {
  it('parses with levelDiscountPercentage', () => {
    const quote = PricingQuoteSchema.parse({
      vehicleId: validUuid,
      currency: 'ARS',
      basePriceCents: 10000,
      durationDays: 10,
      subtotalCents: 100000,
      appliedDiscountTier: { minimumDays: 7, discountPercentage: 15 },
      appliedDiscountPercentage: 15,
      discountCents: 15000,
      totalCents: 85000,
      levelDiscountPercentage: 10,
    });

    expect(quote.levelDiscountPercentage).toBe(10);
  });

  it('parses without levelDiscountPercentage', () => {
    const quote = PricingQuoteSchema.parse({
      vehicleId: validUuid,
      currency: 'ARS',
      basePriceCents: 10000,
      durationDays: 2,
      subtotalCents: 20000,
      appliedDiscountTier: null,
      appliedDiscountPercentage: 0,
      discountCents: 0,
      totalCents: 20000,
    });

    expect(quote.levelDiscountPercentage).toBeUndefined();
  });
});
