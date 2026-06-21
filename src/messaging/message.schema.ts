import { z } from 'zod';

export const MessageSchema = z.object({
  id: z.string().uuid(),
  reservationId: z.string().uuid(),
  senderId: z.string().min(1),
  body: z.string().trim().min(1).max(1000),
  sentAt: z.string().datetime(),
});
export type Message = z.infer<typeof MessageSchema>;

export const SendMessageRequestSchema = z.object({
  body: z.string().trim().min(1).max(1000),
});
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

export const SendMessageResponseSchema = MessageSchema;
export type SendMessageResponse = z.infer<typeof SendMessageResponseSchema>;

export const ListMessagesResponseSchema = z.object({
  items: z.array(MessageSchema),
  lastSeenAt: z.string().datetime().nullable(),
});
export type ListMessagesResponse = z.infer<typeof ListMessagesResponseSchema>;

export const MarkReadBodySchema = z.object({
  lastReadAt: z.string().datetime(),
});
export type MarkReadBody = z.infer<typeof MarkReadBodySchema>;
