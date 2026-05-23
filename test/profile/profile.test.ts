import { describe, expect, it } from 'vitest';
import { GetMyProfileResponseSchema } from '../../src/profile/profile';

const validUuid = '018f8b3c-4d0e-7000-8000-000000000001';

describe('GetMyProfileResponseSchema', () => {
  it('parses a profile with balance in cents', () => {
    const profile = GetMyProfileResponseSchema.parse({
      id: validUuid,
      name: 'Juan Perez',
      email: 'juan@example.com',
      phone: '1123456789',
      avatarUrl: null,
      verificationStatus: 'verified',
      level: 'silver',
      reputationScore: 4.8,
      balanceInCents: 1250000,
      preferences: {
        transmission: null,
        accessibility: [],
        maxPriceDaily: null,
      },
      autoAccept: false,
    });

    expect(profile.balanceInCents).toBe(1250000);
  });
});