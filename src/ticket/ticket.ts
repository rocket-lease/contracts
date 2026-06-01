import { z } from 'zod';

export const TicketStatusSchema = z.enum(['open', 'under_review', 'resolved', 'rejected']);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;
export const TICKET_STATUS = TicketStatusSchema.enum;

export const TicketReportedBySchema = z.enum(['conductor', 'rentador']);
export type TicketReportedBy = z.infer<typeof TicketReportedBySchema>;

export const CreateTicketRequestSchema = z.object({
  reservationId: z.string().uuid(),
  description: z.string().min(1).max(1000),
  photoUrls: z.array(z.string().url()).max(5).default([]),
});
export type CreateTicketRequest = z.infer<typeof CreateTicketRequestSchema>;

export const TicketResponseSchema = z.object({
  id: z.string().uuid(),
  reservationId: z.string().uuid(),
  reportedBy: TicketReportedBySchema,
  status: TicketStatusSchema,
  description: z.string(),
  photoUrls: z.array(z.string()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type TicketResponse = z.infer<typeof TicketResponseSchema>;

export const GetMyTicketsResponseSchema = z.array(TicketResponseSchema);
export type GetMyTicketsResponse = z.infer<typeof GetMyTicketsResponseSchema>;
