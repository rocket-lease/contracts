import { describe, expect, it } from 'vitest';
import { GetMyProfileResponseSchema, GetPublicProfileResponseSchema } from '../../src/profile/profile';

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
      isAdmin: false,
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
    expect(profile.isAdmin).toBe(false);
  });

  it('accepts the admin flag when present', () => {
    const base = {
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
      balanceInCents: 0,
      preferences: {
        transmission: null,
        accessibility: [],
        maxPriceDaily: null,
      },
      autoAccept: false,
    };

    expect(GetMyProfileResponseSchema.parse({ ...base, isAdmin: true }).isAdmin).toBe(true);
    expect(GetMyProfileResponseSchema.parse({ ...base, isAdmin: false }).isAdmin).toBe(false);
  });
});

describe('GetPublicProfileResponseSchema', () => {
  const publicBase = {
    id: validUuid,
    name: 'Ana García',
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
    level: 'gold',
    reputationScore: 4.8,
  };

  it('parsea un perfil público válido', () => {
    const profile = GetPublicProfileResponseSchema.parse(publicBase);
    expect(profile.id).toBe(validUuid);
    expect(profile.name).toBe('Ana García');
    expect(profile.level).toBe('gold');
    expect(profile.reputationScore).toBe(4.8);
  });

  it('rechaza datos con email (campo privado)', () => {
    expect(() =>
      GetPublicProfileResponseSchema.parse({ ...publicBase, email: 'ana@example.com' }),
    ).not.toThrow();
    const profile = GetPublicProfileResponseSchema.parse({ ...publicBase, email: 'ana@example.com' });
    expect((profile as any).email).toBeUndefined();
  });

  it('el tipo resultante no incluye email, phone, balanceInCents, preferences ni autoAccept', () => {
    const profile = GetPublicProfileResponseSchema.parse(publicBase);
    expect('email' in profile).toBe(false);
    expect('phone' in profile).toBe(false);
    expect('balanceInCents' in profile).toBe(false);
    expect('preferences' in profile).toBe(false);
    expect('autoAccept' in profile).toBe(false);
    expect('isAdmin' in profile).toBe(false);
  });
});