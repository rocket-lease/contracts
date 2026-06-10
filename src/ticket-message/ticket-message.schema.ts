import { z } from 'zod';

export const TicketMessageTypeSchema = z.enum(['user', 'info_request']);
export type TicketMessageType = z.infer<typeof TicketMessageTypeSchema>;

export const TicketMessageSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  senderId: z.string().min(1),
  channelParticipantId: z.string().uuid(),
  messageType: TicketMessageTypeSchema,
  body: z.string().trim().min(1).max(1000),
  sentAt: z.string().datetime(),
});
export type TicketMessage = z.infer<typeof TicketMessageSchema>;

export const SendTicketMessageRequestSchema = z.object({
  body: z.string().trim().min(1).max(1000),
  channelParticipantId: z.string().uuid().optional(),
});
export type SendTicketMessageRequest = z.infer<typeof SendTicketMessageRequestSchema>;

export const SendTicketMessageResponseSchema = TicketMessageSchema;
export type SendTicketMessageResponse = z.infer<typeof SendTicketMessageResponseSchema>;

export const ListTicketMessagesResponseSchema = z.object({
  items: z.array(TicketMessageSchema),
});
export type ListTicketMessagesResponse = z.infer<typeof ListTicketMessagesResponseSchema>;
