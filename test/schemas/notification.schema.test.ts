import { describe, it, expect } from 'vitest';
import {
  InAppNotificationSchema,
  ListNotificationsResponseSchema,
  UnreadCountResponseSchema,
} from '../../src/schemas/notification.schema';

const validDatetime = '2026-06-01T12:00:00.000Z';

const valid = {
  id: '018f8b3c-4d0e-7000-8000-000000000001',
  title: 'Reserva confirmada',
  body: 'Tu reserva del Toyota Corolla fue confirmada.',
  url: '/reservas/018f8b3c-4d0e-7000-8000-000000000002',
  imageUrl: null,
  readAt: null,
  createdAt: validDatetime,
};

describe('InAppNotificationSchema', () => {
  it('parses an unread notification', () => {
    expect(InAppNotificationSchema.parse(valid)).toEqual(valid);
  });

  it('parses a read notification with null url', () => {
    const read = { ...valid, url: null, readAt: validDatetime };
    expect(InAppNotificationSchema.parse(read)).toEqual(read);
  });

  it('parses a notification with an image url', () => {
    const withImage = { ...valid, imageUrl: 'https://cdn.example.com/car.jpg' };
    expect(InAppNotificationSchema.parse(withImage)).toEqual(withImage);
  });

  it('rejects a non-uuid id', () => {
    expect(InAppNotificationSchema.safeParse({ ...valid, id: 'nope' }).success).toBe(false);
  });
});

describe('ListNotificationsResponseSchema', () => {
  it('parses a list with its unread count', () => {
    const payload = { notifications: [valid], unreadCount: 1 };
    expect(ListNotificationsResponseSchema.parse(payload)).toEqual(payload);
  });

  it('rejects a negative unread count', () => {
    expect(
      ListNotificationsResponseSchema.safeParse({ notifications: [], unreadCount: -1 }).success,
    ).toBe(false);
  });
});

describe('UnreadCountResponseSchema', () => {
  it('parses an unread count', () => {
    expect(UnreadCountResponseSchema.parse({ unreadCount: 3 })).toEqual({ unreadCount: 3 });
  });
});
