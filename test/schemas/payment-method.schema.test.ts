import { describe, it, expect } from 'vitest';
import { SavedPaymentMethodSchema, CreateSavedPaymentMethodSchema, UpdateSavedPaymentMethodSchema } from '../../src/schemas/payment-method.schema';

describe('SavedPaymentMethodSchema', () => {
  it('parses a valid card payment method', () => {
    const data = {
      id: '018f3a3e-1111-7111-8111-111111111111',
      createdAt: '2024-05-24T10:00:00Z',
      type: 'card',
      details: {
        lastFour: '1234',
        brand: 'visa',
        expMonth: 12,
        expYear: 2030,
        cardholderName: 'Juan Perez',
      },
    };
    expect(SavedPaymentMethodSchema.parse(data)).toEqual(data);
  });

  it('fails with invalid digital wallet missing provider', () => {
    const data = {
      id: '018f3a3e-1111-7111-8111-111111111111',
      createdAt: '2024-05-24T10:00:00Z',
      type: 'digital_wallet',
      details: {
        alias: 'juanperez',
      },
    };
    const result = SavedPaymentMethodSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('CreateSavedPaymentMethodSchema', () => {
  it('parses valid card creation data', () => {
    const data = {
      type: 'card',
      details: {
        lastFour: '5678',
        brand: 'mastercard',
        expMonth: 5,
        expYear: 2028,
        cardholderName: 'Maria Lopez',
      },
    };
    expect(CreateSavedPaymentMethodSchema.parse(data)).toEqual(data);
  });

  it('fails if card lastFour does not have 4 digits', () => {
    const data = {
      type: 'card',
      details: {
        lastFour: '123',
        brand: 'visa',
        expMonth: 12,
        expYear: 2030,
        cardholderName: 'Juan Perez',
      },
    };
    const result = CreateSavedPaymentMethodSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});

describe('UpdateSavedPaymentMethodSchema', () => {
  it('parses valid update for card', () => {
    const data = {
      type: 'card',
      details: {
        expMonth: 1,
        expYear: 2032,
      },
    };
    expect(UpdateSavedPaymentMethodSchema.parse(data)).toEqual(data);
  });

  it('fails if update details is empty', () => {
    const data = {
      type: 'card',
      details: {},
    };
    const result = UpdateSavedPaymentMethodSchema.safeParse(data);
    expect(result.success).toBe(false);
  });
});
