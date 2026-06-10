import { z } from 'zod';

export const CreateReviewRequestSchema = z.object({
  targetType: z.enum(['vehicle', 'rentador', 'conductor']),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500),
});
export type CreateReviewRequest = z.infer<typeof CreateReviewRequestSchema>;

export const ReviewItemSchema = z.object({
  id: z.string().uuid(),
  reservationId: z.string().uuid(),
  reviewerName: z.string(),
  targetType: z.enum(['vehicle', 'rentador', 'conductor']),
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
  createdAt: z.string().datetime(),
});
export type ReviewItem = z.infer<typeof ReviewItemSchema>;

export const CreateReviewResponseSchema = ReviewItemSchema;
export type CreateReviewResponse = z.infer<typeof CreateReviewResponseSchema>;

export const RentadorReviewsResponseSchema = z.array(ReviewItemSchema);
export type RentadorReviewsResponse = z.infer<typeof RentadorReviewsResponseSchema>;
