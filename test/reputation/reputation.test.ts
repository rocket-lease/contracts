import { describe, it, expect } from 'vitest';
import {
  ReputationBadgeSchema,
  GetReputationResponseSchema,
} from '../../src/reputation/reputation';

describe('ReputationBadgeSchema', () => {
  it('parses valid badge', () => {
    expect(ReputationBadgeSchema.parse('conductor_destacado')).toBe('conductor_destacado');
  });

  it('rejects invalid badge', () => {
    expect(ReputationBadgeSchema.safeParse('other').success).toBe(false);
  });
});

describe('GetReputationResponseSchema', () => {
  const valid = {
    userId: '018f8b3c-4d0e-7000-8000-000000000001',
    score: 4.8,
    reviewCount: 15,
    badges: ['conductor_destacado'],
    isLowReputation: false,
    penaltyCount: 0,
  };

  it('parses valid response', () => {
    expect(GetReputationResponseSchema.parse(valid)).toEqual(valid);
  });

  it('rejects score out of range', () => {
    expect(GetReputationResponseSchema.safeParse({ ...valid, score: 5.1 }).success).toBe(false);
    expect(GetReputationResponseSchema.safeParse({ ...valid, score: -0.1 }).success).toBe(false);
  });

  it('rejects negative reviewCount', () => {
    expect(GetReputationResponseSchema.safeParse({ ...valid, reviewCount: -1 }).success).toBe(false);
  });

  it('rejects negative penaltyCount', () => {
    expect(GetReputationResponseSchema.safeParse({ ...valid, penaltyCount: -1 }).success).toBe(false);
  });
});
