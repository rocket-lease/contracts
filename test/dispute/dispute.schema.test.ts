import { describe, it, expect } from 'vitest';
import {
  DisputeStatusSchema,
  PenaltyTypeSchema,
  RequestDisputeInfoRequestSchema,
  DisputePenaltySchema,
  IssueDisputeVerdictRequestSchema,
  AppealDisputeRequestSchema,
  DisputeResolutionResponseSchema,
  DISPUTE_STATUS,
  PENALTY_TYPE,
} from '../../src/dispute/dispute.schema';

const validUuid = '018f8b3c-4d0e-7000-8000-000000000001';
const validUuid2 = '018f8b3c-4d0e-7000-8000-000000000002';
const validDatetime = '2026-06-01T12:00:00.000Z';

describe('DisputeStatusSchema', () => {
  it('accepts all valid statuses', () => {
    for (const s of ['escalated', 'awaiting_info', 'ruled', 'appealed', 'closed']) {
      expect(DisputeStatusSchema.parse(s)).toBe(s);
    }
  });

  it('rejects unknown status', () => {
    expect(DisputeStatusSchema.safeParse('open').success).toBe(false);
  });

  it('DISPUTE_STATUS exposes enum values', () => {
    expect(DISPUTE_STATUS.escalated).toBe('escalated');
    expect(DISPUTE_STATUS.closed).toBe('closed');
  });
});

describe('PenaltyTypeSchema', () => {
  it('accepts fixed and percentage', () => {
    expect(PenaltyTypeSchema.parse('fixed')).toBe('fixed');
    expect(PenaltyTypeSchema.parse('percentage')).toBe('percentage');
  });

  it('rejects unknown values', () => {
    expect(PenaltyTypeSchema.safeParse('other').success).toBe(false);
  });

  it('PENALTY_TYPE exposes enum values', () => {
    expect(PENALTY_TYPE.fixed).toBe('fixed');
    expect(PENALTY_TYPE.percentage).toBe('percentage');
  });
});

describe('RequestDisputeInfoRequestSchema', () => {
  it('parsea un mensaje válido', () => {
    const result = RequestDisputeInfoRequestSchema.parse({
      targetParticipantId: validUuid,
      message: 'Necesitamos más fotos',
    });
    expect(result.message).toBe('Necesitamos más fotos');
  });

  it('rechaza mensaje vacío', () => {
    expect(
      RequestDisputeInfoRequestSchema.safeParse({ targetParticipantId: validUuid, message: '' }).success,
    ).toBe(false);
  });

  it('rechaza mensaje de más de 1000 caracteres', () => {
    expect(
      RequestDisputeInfoRequestSchema.safeParse({
        targetParticipantId: validUuid,
        message: 'x'.repeat(1001),
      }).success,
    ).toBe(false);
  });
});

describe('DisputePenaltySchema', () => {
  it('acepta penalización fija con amountCents', () => {
    const result = DisputePenaltySchema.parse({ type: 'fixed', amountCents: 50000 });
    expect(result.amountCents).toBe(50000);
  });

  it('acepta penalización porcentual con percentage', () => {
    const result = DisputePenaltySchema.parse({ type: 'percentage', percentage: 10 });
    expect(result.percentage).toBe(10);
  });

  it('rechaza fija sin amountCents', () => {
    expect(DisputePenaltySchema.safeParse({ type: 'fixed' }).success).toBe(false);
  });

  it('rechaza porcentual sin percentage', () => {
    expect(DisputePenaltySchema.safeParse({ type: 'percentage' }).success).toBe(false);
  });

  it('rechaza percentage fuera de rango', () => {
    expect(
      DisputePenaltySchema.safeParse({ type: 'percentage', percentage: 0 }).success,
    ).toBe(false);
    expect(
      DisputePenaltySchema.safeParse({ type: 'percentage', percentage: 101 }).success,
    ).toBe(false);
  });

  it('rechaza amountCents no positivo', () => {
    expect(
      DisputePenaltySchema.safeParse({ type: 'fixed', amountCents: 0 }).success,
    ).toBe(false);
  });
});

describe('IssueDisputeVerdictRequestSchema', () => {
  it('parsea un fallo sin penalización', () => {
    const result = IssueDisputeVerdictRequestSchema.parse({
      verdict: 'No se encontró evidencia suficiente para responsabilizar a ninguna parte.',
      responsibleUserId: null,
      penalty: null,
    });
    expect(result.responsibleUserId).toBeNull();
    expect(result.penalty).toBeNull();
  });

  it('parsea un fallo con penalización fija', () => {
    const result = IssueDisputeVerdictRequestSchema.parse({
      verdict: 'El rentador es responsable por el daño reportado.',
      responsibleUserId: validUuid,
      penalty: { type: 'fixed', amountCents: 200000 },
    });
    expect(result.penalty?.amountCents).toBe(200000);
  });

  it('rechaza verdict vacío', () => {
    expect(
      IssueDisputeVerdictRequestSchema.safeParse({
        verdict: '',
        responsibleUserId: null,
        penalty: null,
      }).success,
    ).toBe(false);
  });

  it('rechaza penalización inválida (fija sin monto)', () => {
    expect(
      IssueDisputeVerdictRequestSchema.safeParse({
        verdict: 'Fallo válido con penalización mal formada.',
        responsibleUserId: validUuid,
        penalty: { type: 'fixed' },
      }).success,
    ).toBe(false);
  });
});

describe('AppealDisputeRequestSchema', () => {
  it('parsea una apelación válida', () => {
    const result = AppealDisputeRequestSchema.parse({ reason: 'No estoy de acuerdo con el fallo' });
    expect(result.reason).toBe('No estoy de acuerdo con el fallo');
  });

  it('rechaza razón vacía', () => {
    expect(AppealDisputeRequestSchema.safeParse({ reason: '' }).success).toBe(false);
  });
});

describe('DisputeResolutionResponseSchema', () => {
  const valid = {
    id: validUuid,
    ticketId: validUuid2,
    status: 'escalated',
    moderatorId: null,
    conductorId: validUuid,
    rentadorId: validUuid2,
    infoRequestedAt: null,
    infoDeadlineAt: null,
    verdict: null,
    responsibleUserId: null,
    penaltyType: null,
    penaltyAmountCents: null,
    penaltyPercentage: null,
    ruledAt: null,
    appealCount: 0,
    createdAt: validDatetime,
    updatedAt: validDatetime,
  };

  it('parsea una disputa recién escalada', () => {
    const result = DisputeResolutionResponseSchema.parse(valid);
    expect(result.status).toBe('escalated');
    expect(result.appealCount).toBe(0);
  });

  it('parsea una disputa fallada con penalización', () => {
    const result = DisputeResolutionResponseSchema.parse({
      ...valid,
      status: 'ruled',
      moderatorId: validUuid,
      verdict: 'El conductor es responsable',
      responsibleUserId: validUuid2,
      penaltyType: 'percentage',
      penaltyPercentage: 15,
      ruledAt: validDatetime,
    });
    expect(result.penaltyType).toBe('percentage');
    expect(result.penaltyPercentage).toBe(15);
  });

  it('rechaza status inválido', () => {
    expect(DisputeResolutionResponseSchema.safeParse({ ...valid, status: 'open' }).success).toBe(
      false,
    );
  });

  it('rechaza si falta appealCount', () => {
    const { appealCount: _, ...noAppealCount } = valid;
    expect(DisputeResolutionResponseSchema.safeParse(noAppealCount).success).toBe(false);
  });
});
