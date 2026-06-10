import { z } from 'zod';

export const DisputeStatusSchema = z.enum([
  'escalated',
  'awaiting_info',
  'ruled',
  'appealed',
  'closed',
]);
export type DisputeStatus = z.infer<typeof DisputeStatusSchema>;
export const DISPUTE_STATUS = DisputeStatusSchema.enum;

export const PenaltyTypeSchema = z.enum(['fixed', 'percentage']);
export type PenaltyType = z.infer<typeof PenaltyTypeSchema>;
export const PENALTY_TYPE = PenaltyTypeSchema.enum;

export const RequestDisputeInfoRequestSchema = z.object({
  targetParticipantId: z.string().uuid(),
  message: z.string().trim().min(1).max(1000),
});
export type RequestDisputeInfoRequest = z.infer<typeof RequestDisputeInfoRequestSchema>;

export const DisputePenaltySchema = z
  .object({
    type: PenaltyTypeSchema,
    amountCents: z.number().int().positive().optional(),
    percentage: z.number().min(1).max(100).optional(),
  })
  .refine(
    (penalty) =>
      penalty.type === 'fixed' ? penalty.amountCents !== undefined : penalty.percentage !== undefined,
    { message: 'penalty must include amountCents (fixed) or percentage (percentage)' },
  );
export type DisputePenalty = z.infer<typeof DisputePenaltySchema>;

export const IssueDisputeVerdictRequestSchema = z.object({
  verdict: z.string().trim().min(1).max(2000),
  responsibleUserId: z.string().uuid().nullable(),
  penalty: DisputePenaltySchema.nullable(),
});
export type IssueDisputeVerdictRequest = z.infer<typeof IssueDisputeVerdictRequestSchema>;

export const AppealDisputeRequestSchema = z.object({
  reason: z.string().trim().min(1).max(1000),
});
export type AppealDisputeRequest = z.infer<typeof AppealDisputeRequestSchema>;

export const DisputeResolutionResponseSchema = z.object({
  id: z.string().uuid(),
  ticketId: z.string().uuid(),
  status: DisputeStatusSchema,
  moderatorId: z.string().uuid().nullable(),
  conductorId: z.string().uuid(),
  rentadorId: z.string().uuid(),
  infoRequestedAt: z.string().datetime().nullable(),
  infoDeadlineAt: z.string().datetime().nullable(),
  verdict: z.string().nullable(),
  responsibleUserId: z.string().uuid().nullable(),
  penaltyType: PenaltyTypeSchema.nullable(),
  penaltyAmountCents: z.number().int().nullable(),
  penaltyPercentage: z.number().nullable(),
  ruledAt: z.string().datetime().nullable(),
  appealCount: z.number().int(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type DisputeResolutionResponse = z.infer<typeof DisputeResolutionResponseSchema>;
