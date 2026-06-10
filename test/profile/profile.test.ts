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
      identityVerification: {
        status: 'verified',
        providerName: 'stub-identity-provider',
        providerRequestId: 'req-1',
        rejectionReason: null,
        submittedAt: '2026-05-25T12:00:00.000Z',
        reviewAfterAt: '2026-05-25T12:00:30.000Z',
        reviewedAt: '2026-05-25T12:00:30.000Z',
        verifiedAt: '2026-05-25T12:00:30.000Z',
      },
      driverLicenseVerification: {
        status: 'not_started',
        providerName: null,
        providerRequestId: null,
        rejectionReason: null,
        submittedAt: null,
        reviewAfterAt: null,
        reviewedAt: null,
        verifiedAt: null,
      },
      level: 'silver',
      reputationScore: 4.8,
      reviewCount: 15,
      badges: [],
      isLowReputation: false,
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