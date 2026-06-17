import { describe, it, expect } from 'vitest';
import {
  CreateReviewRequestSchema,
  ReviewItemSchema,
} from '../../src/schemas/review.schema';

const validDatetime = '2026-06-01T12:00:00.000Z';

describe('CreateReviewRequestSchema', () => {
  const valid = {
    targetType: 'rentador',
    rating: 5,
    comment: 'Great',
  };

  it('parses without vehicleRating', () => {
    expect(CreateReviewRequestSchema.parse(valid)).toEqual(valid);
  });

  it('parses with vehicleRating', () => {
    const withVehicle = { ...valid, vehicleRating: 4 };
    expect(CreateReviewRequestSchema.parse(withVehicle)).toEqual(withVehicle);
  });

  it('rejects invalid rating', () => {
    expect(CreateReviewRequestSchema.safeParse({ ...valid, rating: 6 }).success).toBe(false);
  });

  it('rejects invalid vehicleRating', () => {
    expect(CreateReviewRequestSchema.safeParse({ ...valid, vehicleRating: 0 }).success).toBe(false);
  });
});

describe('ReviewItemSchema', () => {
  const valid = {
    id: '018f8b3c-4d0e-7000-8000-000000000001',
    reservationId: '018f8b3c-4d0e-7000-8000-000000000002',
    reviewerId: '018f8b3c-4d0e-7000-8000-000000000003',
    reviewerName: 'John',
    targetType: 'conductor',
    rating: 5,
    vehicleRating: null,
    comment: 'Great conductor',
    createdAt: validDatetime,
  };

  it('parses with null vehicleRating', () => {
    expect(ReviewItemSchema.parse(valid)).toEqual(valid);
  });

  it('parses with number vehicleRating', () => {
    const withVehicle = { ...valid, vehicleRating: 5 };
    expect(ReviewItemSchema.parse(withVehicle)).toEqual(withVehicle);
  });

  it('rejects invalid vehicleRating', () => {
    expect(ReviewItemSchema.safeParse({ ...valid, vehicleRating: 6 }).success).toBe(false);
  });
});
