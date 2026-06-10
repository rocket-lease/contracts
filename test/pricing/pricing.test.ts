import { describe, expect, it } from 'vitest';
import {
  PricingDiscountTierSchema,
  PricingDiscountTiersSchema,
  PricingQuoteRequestSchema,
  PricingQuoteSchema,
} from '../../src/pricing/pricing';

const validUuid = '018f8b3c-4d0e-7000-8000-000000000001';

describe('PricingDiscountTierSchema', () => {
  it('parses a valid tier', () => {
    expect(
      PricingDiscountTierSchema.parse({ minimumDays: 7, discountPercentage: 15 }),
    ).toEqual({ minimumDays: 7, discountPercentage: 15 });
  });

  it('rejects tiers above the cap', () => {
    expect(() =>
      PricingDiscountTierSchema.parse({ minimumDays: 7, discountPercentage: 51 }),
    ).toThrow();
  });
});

describe('PricingDiscountTiersSchema', () => {
  it('parses ascending unique tiers', () => {
    const tiers = PricingDiscountTiersSchema.parse([
      { minimumDays: 3, discountPercentage: 5 },
      { minimumDays: 7, discountPercentage: 15 },
    ]);

    expect(tiers).toHaveLength(2);
  });

  it('rejects duplicated minimumDays', () => {
    expect(() =>
      PricingDiscountTiersSchema.parse([
        { minimumDays: 7, discountPercentage: 10 },
        { minimumDays: 7, discountPercentage: 15 },
      ]),
    ).toThrow();
  });

  it('rejects unsorted tiers', () => {
    expect(() =>
      PricingDiscountTiersSchema.parse([
        { minimumDays: 14, discountPercentage: 20 },
        { minimumDays: 7, discountPercentage: 10 },
      ]),
    ).toThrow();
  });
});

describe('PricingQuoteRequestSchema', () => {
  it('parses a valid quote request', () => {
    const request = PricingQuoteRequestSchema.parse({
      vehicleId: validUuid,
      startAt: '2026-06-01T10:00:00.000Z',
      endAt: '2026-06-08T10:00:00.000Z',
    });

    expect(request.vehicleId).toBe(validUuid);
  });

  it('rejects endAt before startAt', () => {
    expect(() =>
      PricingQuoteRequestSchema.parse({
        vehicleId: validUuid,
        startAt: '2026-06-08T10:00:00.000Z',
        endAt: '2026-06-01T10:00:00.000Z',
      }),
    ).toThrow();
  });
});

describe('PricingQuoteSchema', () => {
  it('parses a quote with discount applied', () => {
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
    });

    expect(quote.totalCents).toBe(85000);
  });

  it('parses a quote without discount', () => {
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

    expect(quote.appliedDiscountTier).toBeNull();
  });

  it('parses a quote with dynamic pricing fields', () => {
    const quote = PricingQuoteSchema.parse({
      vehicleId: validUuid,
      currency: 'ARS',
      basePriceCents: 10000,
      durationDays: 2,
      subtotalCents: 26000,
      appliedDiscountTier: null,
      appliedDiscountPercentage: 0,
      discountCents: 0,
      totalCents: 26000,
      multiplier: 1.3,
      deliveryFeeCents: 0,
      quoteToken: validUuid,
      expiresAt: '2026-06-04T20:05:00.000Z',
    });

    expect(quote.multiplier).toBe(1.3);
    expect(quote.quoteToken).toBe(validUuid);
  });

  it('rejects multiplier above 2.0', () => {
    expect(() =>
      PricingQuoteSchema.parse({
        vehicleId: validUuid,
        currency: 'ARS',
        basePriceCents: 10000,
        durationDays: 2,
        subtotalCents: 20000,
        appliedDiscountTier: null,
        appliedDiscountPercentage: 0,
        discountCents: 0,
        totalCents: 20000,
        multiplier: 2.5,
      }),
    ).toThrow();
  });

  it('rejects multiplier below 0.7', () => {
    expect(() =>
      PricingQuoteSchema.parse({
        vehicleId: validUuid,
        currency: 'ARS',
        basePriceCents: 10000,
        durationDays: 2,
        subtotalCents: 20000,
        appliedDiscountTier: null,
        appliedDiscountPercentage: 0,
        discountCents: 0,
        totalCents: 20000,
        multiplier: 0.5,
      }),
    ).toThrow();
  });
});

describe('PricingQuoteRequestSchema — dynamic pricing extensions', () => {
  it('accepts withHomeDelivery / withHomeReturn flags', () => {
    const request = PricingQuoteRequestSchema.parse({
      vehicleId: validUuid,
      startAt: '2026-06-01T10:00:00.000Z',
      endAt: '2026-06-08T10:00:00.000Z',
      withHomeDelivery: true,
      withHomeReturn: false,
    });
    expect(request.withHomeDelivery).toBe(true);
    expect(request.withHomeReturn).toBe(false);
  });
});