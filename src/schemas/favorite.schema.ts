import { z } from 'zod';

export const AddFavoriteRequestSchema = z.object({
  vehicleId: z.string().uuid(),
});
export type AddFavoriteRequest = z.infer<typeof AddFavoriteRequestSchema>;

export const AddFavoriteResponseSchema = z.object({
  id: z.string().uuid(),
  vehicleId: z.string().uuid(),
  conductorId: z.string().uuid(),
  createdAt: z.string().datetime(),
});
export type AddFavoriteResponse = z.infer<typeof AddFavoriteResponseSchema>;

export const FavoriteItemSchema = z.object({
  id: z.string().uuid(),
  vehicleId: z.string().uuid(),
  createdAt: z.string().datetime(),
});
export type FavoriteItem = z.infer<typeof FavoriteItemSchema>;

export const ListFavoritesResponseSchema = z.object({
  items: z.array(FavoriteItemSchema),
});
export type ListFavoritesResponse = z.infer<typeof ListFavoritesResponseSchema>;
