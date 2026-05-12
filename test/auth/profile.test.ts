import { describe, expect, it } from 'vitest';
import {
  GetMyProfileResponseSchema,
  UpdateMyProfileRequestSchema,
} from '../../src/profile/profile';

const validProfile = {
  id: '8d7d7c3b-96cc-49ab-aaf8-24e71f50a7bd',
  name: 'Juan Perez',
  email: 'juan@example.com',
  phone: '1123456789',
  avatarUrl: 'https://cdn.example.com/avatar.jpg',
  verificationStatus: 'verified',
  level: 'silver',
  reputationScore: 4.6,
  preferences: {
    transmission: 'automatic',
    accessibility: ['movilidad-reducida'],
    maxPriceDaily: 1200000,
  },
} as const;

describe('GetMyProfileResponseSchema', () => {
  it('parses valid profile payload', () => {
    const parsed = GetMyProfileResponseSchema.parse(validProfile);
    expect(parsed.email).toBe(validProfile.email);
    expect(parsed.preferences.transmission).toBe('automatic');
  });

  it('rejects invalid reputation score', () => {
    expect(() =>
      GetMyProfileResponseSchema.parse({ ...validProfile, reputationScore: 6 }),
    ).toThrow();
  });

  it('rejects invalid avatar URL', () => {
    expect(() =>
      GetMyProfileResponseSchema.parse({ ...validProfile, avatarUrl: 'avatar' }),
    ).toThrow();
  });
});

describe('UpdateMyProfileRequestSchema', () => {
  it('parses valid update payload', () => {
    const parsed = UpdateMyProfileRequestSchema.parse({
      name: 'Juan Actualizado',
      phone: '1198765432',
      avatarUrl: null,
      preferences: {
        transmission: null,
        accessibility: [],
        maxPriceDaily: null,
      },
    });

    expect(parsed.avatarUrl).toBeNull();
    expect(parsed.preferences.accessibility).toHaveLength(0);
  });

  it('rejects empty name', () => {
    expect(() =>
      UpdateMyProfileRequestSchema.parse({
        name: '',
        phone: '1198765432',
        avatarUrl: null,
        preferences: {
          transmission: null,
          accessibility: [],
          maxPriceDaily: null,
        },
      }),
    ).toThrow();
  });

  it('rejects non-positive maxPriceDaily', () => {
    expect(() =>
      UpdateMyProfileRequestSchema.parse({
        name: 'Juan',
        phone: '1198765432',
        avatarUrl: null,
        preferences: {
          transmission: null,
          accessibility: [],
          maxPriceDaily: 0,
        },
      }),
    ).toThrow();
  });
});
