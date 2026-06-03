import { describe, it, expect } from 'vitest';
import {
  TicketStatusSchema,
  TicketReportedBySchema,
  TicketTypeSchema,
  CreateTicketRequestSchema,
  TicketResponseSchema,
  GetMyTicketsResponseSchema,
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
  it('accepts vehicle_issue and counterpart_report', () => {
    expect(TicketTypeSchema.parse('vehicle_issue')).toBe('vehicle_issue');
    expect(TicketTypeSchema.parse('counterpart_report')).toBe('counterpart_report');
  });

  it('rejects unknown type', () => {
    expect(TicketTypeSchema.safeParse('other').success).toBe(false);
    expect(TicketTypeSchema.safeParse('').success).toBe(false);
  });

  it('TICKET_TYPE exposes enum values', () => {
    expect(TICKET_TYPE.vehicle_issue).toBe('vehicle_issue');
    expect(TICKET_TYPE.counterpart_report).toBe('counterpart_report');
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

describe('CreateTicketRequestSchema', () => {
  const valid = {
    reservationId: validUuid,
    type: 'vehicle_issue' as const,
    description: 'Goma pinchada al retirar el vehículo',
    photoUrls: [],
  };

  it('parses a valid request without photos', () => {
    const result = CreateTicketRequestSchema.parse(valid);
    expect(result.reservationId).toBe(validUuid);
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
      description: 'Problema con el freno',
    });
    expect(result.photoUrls).toEqual([]);
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
    status: 'open',
    description: 'Goma pinchada',
    photoUrls: [],
    createdAt: validDatetime,
    updatedAt: validDatetime,
  };

  it('parses a valid response', () => {
    const result = TicketResponseSchema.parse(valid);
    expect(result.id).toBe(validUuid);
    expect(result.status).toBe('open');
    expect(result.reportedBy).toBe('conductor');
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
        status: 'under_review',
        description: 'Rayón en la puerta',
        photoUrls: ['https://res.cloudinary.com/foo/image/upload/v1/ticket-photos/abc.jpg'],
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
