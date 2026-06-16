import { z } from 'zod';

export const TicketStatusSchema = z.enum(['open', 'under_review', 'resolved', 'closed']);
export type TicketStatus = z.infer<typeof TicketStatusSchema>;
export const TICKET_STATUS = TicketStatusSchema.enum;

export const TicketResolutionSchema = z.enum(['in_favor', 'against']);
export type TicketResolution = z.infer<typeof TicketResolutionSchema>;

export const TicketReportedBySchema = z.enum(['conductor', 'rentador']);
export type TicketReportedBy = z.infer<typeof TicketReportedBySchema>;

export const TicketTypeSchema = z.enum(['vehicle_issue', 'counterpart_report', 'support_request']);
export type TicketType = z.infer<typeof TicketTypeSchema>;
export const TICKET_TYPE = TicketTypeSchema.enum;

export const CreateTicketRequestSchema = z.object({
  reservationId: z.string().uuid().optional(),
  type: TicketTypeSchema,
  subject: z.string().trim().min(1).max(120),
  description: z.string().min(1).max(1000),
  photoUrls: z.array(z.string().url()).max(5).default([]),
});
export type CreateTicketRequest = z.infer<typeof CreateTicketRequestSchema>;

export const TicketResponseSchema = z.object({
  id: z.string().uuid(),
  reservationId: z.string().uuid().nullable(),
  type: TicketTypeSchema,
  reportedBy: TicketReportedBySchema.nullable(),
  reporterId: z.string().min(1),
  conductorId: z.string().uuid().nullable(),
  rentadorId: z.string().uuid().nullable(),
  status: TicketStatusSchema,
  subject: z.string(),
  resolution: TicketResolutionSchema.nullable(),
  description: z.string(),
  photoUrls: z.array(z.string()),
  rating: z.number().int().min(1).max(5).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type TicketResponse = z.infer<typeof TicketResponseSchema>;

export const GetMyTicketsResponseSchema = z.array(TicketResponseSchema);
export type GetMyTicketsResponse = z.infer<typeof GetMyTicketsResponseSchema>;

export const GetReservationTicketsResponseSchema = z.array(TicketResponseSchema);
export type GetReservationTicketsResponse = z.infer<typeof GetReservationTicketsResponseSchema>;

export const GetTicketsAgainstMeResponseSchema = z.array(TicketResponseSchema);
export type GetTicketsAgainstMeResponse = z.infer<typeof GetTicketsAgainstMeResponseSchema>;

export const GetAdminTicketsResponseSchema = z.array(TicketResponseSchema);
export type GetAdminTicketsResponse = z.infer<typeof GetAdminTicketsResponseSchema>;

export const RateTicketRequestSchema = z.object({
  rating: z.number().int().min(1).max(5),
});
export type RateTicketRequest = z.infer<typeof RateTicketRequestSchema>;

export const TicketImpactEconomicSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('absolute'),
    amountCents: z.number().int().refine((n) => n !== 0, 'Monto no puede ser 0'),
  }),
  z.object({
    type: z.literal('percentage'),
    percentage: z.number().min(1).max(100),
  }),
]);
export type TicketImpactEconomic = z.infer<typeof TicketImpactEconomicSchema>;

export const TicketImpactReputationSchema = z.object({
  scoreDeduction: z.number().positive().max(5),
});
export type TicketImpactReputation = z.infer<typeof TicketImpactReputationSchema>;

export const TicketPartyImpactSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['conductor', 'rentador']),
  economic: TicketImpactEconomicSchema.optional(),
  reputation: TicketImpactReputationSchema.optional(),
}).refine((v) => v.economic !== undefined || v.reputation !== undefined, {
  message: 'Al menos un tipo de impacto debe estar presente',
});
export type TicketPartyImpact = z.infer<typeof TicketPartyImpactSchema>;

export const ResolveTicketRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('close') }),
  z.object({
    type: z.literal('fault'),
    primary: TicketPartyImpactSchema,
    counterpart: TicketPartyImpactSchema.optional(),
  }),
]);
export type ResolveTicketRequest = z.infer<typeof ResolveTicketRequestSchema>;
