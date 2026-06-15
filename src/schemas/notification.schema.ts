import { z } from 'zod';

export const InAppNotificationSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  body: z.string(),
  url: z.string().nullable(),
  readAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});
export type InAppNotification = z.infer<typeof InAppNotificationSchema>;

export const ListNotificationsResponseSchema = z.object({
  notifications: z.array(InAppNotificationSchema),
  unreadCount: z.number().int().nonnegative(),
});
export type ListNotificationsResponse = z.infer<typeof ListNotificationsResponseSchema>;

export const UnreadCountResponseSchema = z.object({
  unreadCount: z.number().int().nonnegative(),
});
export type UnreadCountResponse = z.infer<typeof UnreadCountResponseSchema>;
