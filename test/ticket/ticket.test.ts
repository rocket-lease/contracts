import { describe, it, expect } from 'vitest';
import {
  TicketStatusSchema,
  TicketReportedBySchema,
  TicketTypeSchema,
  CreateTicketRequestSchema,
  TicketResponseSchema,
  GetMyTicketsResponseSchema,
  RateTicketRequestSchema,
  UpdateTicketStatusRequestSchema,
  TicketResolutionSchema,
  TICKET_STATUS,
  TICKET_TYPE,
} from '../../src/ticket/ticket';

const validUuid = '018f8b3c-4d0e-7000-8000-000000000001';
const validUuid2 = '018f8b3c-4d0e-7000-8000-000000000002';
const validDatetime = '2026-06-01T12:00:00.000Z';

describe('TicketStatusSchema', () => {
  it('accepts all valid statuses', () => {
    for (const s of ['open', 'under_review', 'resolved', 'rejected']) {
      expect(TicketStatusSchema.parse(s)).toBe(s);
    }
  });

  it('rejects unknown status', () => {
    expect(TicketStatusSchema.safeParse('pending').success).toBe(false);
    expect(TicketStatusSchema.safeParse('').success).toBe(false);
  });

  it('TICKET_STATUS exposes enum values', () => {
    expect(TICKET_STATUS.open).toBe('open');
    expect(TICKET_STATUS.under_review).toBe('under_review');
    expect(TICKET_STATUS.resolved).toBe('resolved');
    expect(TICKET_STATUS.rejected).toBe('rejected');
  });
});

describe('TicketTypeSchema', () => {
  it('accepts vehicle_issue, counterpart_report and support_request', () => {
    expect(TicketTypeSchema.parse('vehicle_issue')).toBe('vehicle_issue');
    expect(TicketTypeSchema.parse('counterpart_report')).toBe('counterpart_report');
    expect(TicketTypeSchema.parse('support_request')).toBe('support_request');
  });

  it('rejects unknown type', () => {
    expect(TicketTypeSchema.safeParse('other').success).toBe(false);
    expect(TicketTypeSchema.safeParse('').success).toBe(false);
  });

  it('TICKET_TYPE exposes enum values', () => {
    expect(TICKET_TYPE.vehicle_issue).toBe('vehicle_issue');
    expect(TICKET_TYPE.counterpart_report).toBe('counterpart_report');
    expect(TICKET_TYPE.support_request).toBe('support_request');
  });
});

describe('TicketReportedBySchema', () => {
  it('accepts conductor and rentador', () => {
    expect(TicketReportedBySchema.parse('conductor')).toBe('conductor');
    expect(TicketReportedBySchema.parse('rentador')).toBe('rentador');
  });

  it('rejects other values', () => {
    expect(TicketReportedBySchema.safeParse('admin').success).toBe(false);
    expect(TicketReportedBySchema.safeParse('').success).toBe(false);
  });
});

describe('TicketResolutionSchema', () => {
  it('accepts in_favor and against', () => {
    expect(TicketResolutionSchema.parse('in_favor')).toBe('in_favor');
    expect(TicketResolutionSchema.parse('against')).toBe('against');
  });

  it('rejects other values', () => {
    expect(TicketResolutionSchema.safeParse('other').success).toBe(false);
  });
});

describe('CreateTicketRequestSchema', () => {
  const valid = {
    reservationId: validUuid,
    type: 'vehicle_issue' as const,
    subject: 'Goma pinchada',
    description: 'Goma pinchada al retirar el vehículo',
    photoUrls: [],
  };

  it('parses a valid request without photos', () => {
    const result = CreateTicketRequestSchema.parse(valid);
    expect(result.reservationId).toBe(validUuid);
    expect(result.subject).toBe('Goma pinchada');
    expect(result.photoUrls).toEqual([]);
  });

  it('parses a valid request with photos', () => {
    const result = CreateTicketRequestSchema.parse({
      ...valid,
      photoUrls: ['https://res.cloudinary.com/foo/image/upload/v1/ticket-photos/abc.jpg'],
    });
    expect(result.photoUrls).toHaveLength(1);
  });

  it('applies default empty array when photoUrls is omitted', () => {
    const result = CreateTicketRequestSchema.parse({
      reservationId: validUuid,
      type: 'counterpart_report',
      subject: 'Problema con el freno',
      description: 'Problema con el freno',
    });
    expect(result.photoUrls).toEqual([]);
  });

  it('parses a support_request without reservationId', () => {
    const result = CreateTicketRequestSchema.parse({
      type: 'support_request',
      subject: 'No puedo verificar mi DNI',
      description: 'El sistema rechaza la foto de mi documento',
    });
    expect(result.reservationId).toBeUndefined();
    expect(result.type).toBe('support_request');
  });

  it('rejects if type is missing', () => {
    const { type: _, ...noType } = valid;
    expect(CreateTicketRequestSchema.safeParse(noType).success).toBe(false);
  });

  it('rejects if type is invalid', () => {
    expect(CreateTicketRequestSchema.safeParse({ ...valid, type: 'unknown' }).success).toBe(false);
  });

  it('rejects if reservationId is not a UUID', () => {
    expect(
      CreateTicketRequestSchema.safeParse({ ...valid, reservationId: 'not-a-uuid' }).success,
    ).toBe(false);
  });

  it('rejects if subject is empty', () => {
    expect(CreateTicketRequestSchema.safeParse({ ...valid, subject: '' }).success).toBe(false);
  });

  it('rejects if subject exceeds 120 chars', () => {
    expect(
      CreateTicketRequestSchema.safeParse({ ...valid, subject: 'x'.repeat(121) }).success,
    ).toBe(false);
  });

  it('rejects if description is empty', () => {
    expect(
      CreateTicketRequestSchema.safeParse({ ...valid, description: '' }).success,
    ).toBe(false);
  });

  it('rejects if description exceeds 1000 chars', () => {
    expect(
      CreateTicketRequestSchema.safeParse({ ...valid, description: 'x'.repeat(1001) }).success,
    ).toBe(false);
  });

  it('rejects if photoUrls has more than 5 elements', () => {
    const urls = Array.from(
      { length: 6 },
      (_, i) => `https://res.cloudinary.com/foo/image/upload/v1/ticket-photos/img${i}.jpg`,
    );
    expect(
      CreateTicketRequestSchema.safeParse({ ...valid, photoUrls: urls }).success,
    ).toBe(false);
  });

  it('rejects if a photoUrl is not a valid URL', () => {
    expect(
      CreateTicketRequestSchema.safeParse({ ...valid, photoUrls: ['not-a-url'] }).success,
    ).toBe(false);
  });
});

describe('TicketResponseSchema', () => {
  const valid = {
    id: validUuid,
    reservationId: validUuid2,
    type: 'vehicle_issue',
    reportedBy: 'conductor',
    reporterId: 'user-abc',
    conductorId: null,
    rentadorId: null,
    status: 'open',
    subject: 'Goma pinchada',
    resolution: null,
    description: 'Goma pinchada',
    photoUrls: [],
    rating: null,
    createdAt: validDatetime,
    updatedAt: validDatetime,
  };

  it('parses a valid response', () => {
    const result = TicketResponseSchema.parse(valid);
    expect(result.id).toBe(validUuid);
    expect(result.status).toBe('open');
    expect(result.reportedBy).toBe('conductor');
    expect(result.rating).toBeNull();
  });

  it('parses a support_request response with null reservationId/reportedBy', () => {
    const result = TicketResponseSchema.parse({
      ...valid,
      type: 'support_request',
      reservationId: null,
      reportedBy: null,
    });
    expect(result.reservationId).toBeNull();
    expect(result.reportedBy).toBeNull();
  });

  it('parses a response with rating set', () => {
    const result = TicketResponseSchema.parse({ ...valid, status: 'resolved', rating: 5 });
    expect(result.rating).toBe(5);
  });

  it('rejects if rating is out of range', () => {
    expect(TicketResponseSchema.safeParse({ ...valid, rating: 6 }).success).toBe(false);
    expect(TicketResponseSchema.safeParse({ ...valid, rating: 0 }).success).toBe(false);
  });

  it('parses a resolved ticket', () => {
    const resolved = { ...valid, status: 'resolved', resolution: 'against' };
    const result = TicketResponseSchema.parse(resolved);
    expect(result.resolution).toBe('against');
  });

  it('rejects if id is not a UUID', () => {
    expect(TicketResponseSchema.safeParse({ ...valid, id: 'bad' }).success).toBe(false);
  });

  it('rejects if type is invalid', () => {
    expect(TicketResponseSchema.safeParse({ ...valid, type: 'unknown' }).success).toBe(false);
  });

  it('rejects if status is invalid', () => {
    expect(TicketResponseSchema.safeParse({ ...valid, status: 'pending' }).success).toBe(false);
  });

  it('rejects if reportedBy is invalid', () => {
    expect(TicketResponseSchema.safeParse({ ...valid, reportedBy: 'admin' }).success).toBe(false);
  });

  it('rejects if subject is missing', () => {
    const { subject: _, ...noSubject } = valid;
    expect(TicketResponseSchema.safeParse(noSubject).success).toBe(false);
  });

  it('rejects if createdAt is not datetime', () => {
    expect(
      TicketResponseSchema.safeParse({ ...valid, createdAt: '2026-06-01' }).success,
    ).toBe(false);
  });
});

describe('GetMyTicketsResponseSchema', () => {
  it('parses empty array', () => {
    expect(GetMyTicketsResponseSchema.parse([])).toEqual([]);
  });

  it('parses array with one ticket', () => {
    const result = GetMyTicketsResponseSchema.parse([
      {
        id: validUuid,
        reservationId: validUuid2,
        type: 'counterpart_report',
        reportedBy: 'rentador',
        reporterId: 'user-abc',
        conductorId: null,
        rentadorId: null,
        status: 'under_review',
        subject: 'Rayón en la puerta',
        resolution: null,
        description: 'Rayón en la puerta',
        photoUrls: ['https://res.cloudinary.com/foo/image/upload/v1/ticket-photos/abc.jpg'],
        rating: null,
        createdAt: validDatetime,
        updatedAt: validDatetime,
      },
    ]);
    expect(result).toHaveLength(1);
    expect(result[0]?.reportedBy).toBe('rentador');
    expect(result[0]?.type).toBe('counterpart_report');
  });

  it('rejects if any element is invalid', () => {
    expect(
      GetMyTicketsResponseSchema.safeParse([{ id: 'bad' }]).success,
    ).toBe(false);
  });
});

describe('RateTicketRequestSchema', () => {
  it('accepts ratings between 1 and 5', () => {
    for (const rating of [1, 2, 3, 4, 5]) {
      expect(RateTicketRequestSchema.parse({ rating }).rating).toBe(rating);
    }
  });

  it('rejects ratings out of range', () => {
    expect(RateTicketRequestSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(RateTicketRequestSchema.safeParse({ rating: 6 }).success).toBe(false);
  });

  it('rejects non-integer ratings', () => {
    expect(RateTicketRequestSchema.safeParse({ rating: 3.5 }).success).toBe(false);
  });
});

describe('UpdateTicketStatusRequestSchema', () => {
  it('parses a status change without compensation', () => {
    const result = UpdateTicketStatusRequestSchema.parse({ status: 'resolved' });
    expect(result.status).toBe('resolved');
    expect(result.compensation).toBeUndefined();
  });

  it('parses a status change with compensation', () => {
    const result = UpdateTicketStatusRequestSchema.parse({
      status: 'resolved',
      compensation: { responsibleUserId: validUuid, amountCents: 150000 },
    });
    expect(result.compensation?.amountCents).toBe(150000);
  });

  it('rejects an invalid status', () => {
    expect(UpdateTicketStatusRequestSchema.safeParse({ status: 'open' }).success).toBe(false);
  });

  it('rejects compensation with non-positive amountCents', () => {
    expect(
      UpdateTicketStatusRequestSchema.safeParse({
        status: 'resolved',
        compensation: { responsibleUserId: validUuid, amountCents: 0 },
      }).success,
    ).toBe(false);
  });
});
