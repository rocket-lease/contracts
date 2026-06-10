import { describe, it, expect } from 'vitest';
import {
  TicketMessageSchema,
  SendTicketMessageRequestSchema,
  ListTicketMessagesResponseSchema,
} from '../../src/ticket-message/ticket-message.schema';

const validMessage = {
  id: '00000000-0000-0000-0000-000000000001',
  ticketId: '00000000-0000-0000-0000-000000000002',
  senderId: 'user-abc',
  channelParticipantId: '00000000-0000-0000-0000-000000000003',
  messageType: 'user' as const,
  body: '¿Podrían darme una actualización sobre mi ticket?',
  sentAt: '2026-05-24T10:00:00.000Z',
};

describe('TicketMessageSchema', () => {
  it('parsea un mensaje válido', () => {
    const result = TicketMessageSchema.parse(validMessage);
    expect(result.id).toBe(validMessage.id);
    expect(result.body).toBe(validMessage.body);
  });

  it('falla si body está vacío', () => {
    expect(() => TicketMessageSchema.parse({ ...validMessage, body: '' })).toThrow();
  });

  it('falla si body tiene solo espacios (trim colapsa a vacío)', () => {
    expect(() => TicketMessageSchema.parse({ ...validMessage, body: '   ' })).toThrow();
  });

  it('falla si body supera 1000 caracteres', () => {
    expect(() =>
      TicketMessageSchema.parse({ ...validMessage, body: 'a'.repeat(1001) }),
    ).toThrow();
  });

  it('acepta body de exactamente 1000 caracteres', () => {
    const result = TicketMessageSchema.parse({ ...validMessage, body: 'a'.repeat(1000) });
    expect(result.body).toHaveLength(1000);
  });

  it('falla si falta ticketId', () => {
    const { ticketId: _, ...rest } = validMessage;
    expect(() => TicketMessageSchema.parse(rest)).toThrow();
  });

  it('falla si sentAt no es datetime ISO válido', () => {
    expect(() =>
      TicketMessageSchema.parse({ ...validMessage, sentAt: 'no-es-fecha' }),
    ).toThrow();
  });
});

describe('SendTicketMessageRequestSchema', () => {
  it('parsea un body válido', () => {
    const result = SendTicketMessageRequestSchema.parse({ body: 'Hola' });
    expect(result.body).toBe('Hola');
  });

  it('rechaza body vacío', () => {
    expect(() => SendTicketMessageRequestSchema.parse({ body: '' })).toThrow();
  });

  it('rechaza body de solo espacios', () => {
    expect(() => SendTicketMessageRequestSchema.parse({ body: '   ' })).toThrow();
  });

  it('rechaza body de más de 1000 caracteres', () => {
    expect(() =>
      SendTicketMessageRequestSchema.parse({ body: 'x'.repeat(1001) }),
    ).toThrow();
  });
});

describe('ListTicketMessagesResponseSchema', () => {
  it('parsea lista vacía', () => {
    const result = ListTicketMessagesResponseSchema.parse({ items: [] });
    expect(result.items).toHaveLength(0);
  });

  it('parsea lista con mensajes', () => {
    const result = ListTicketMessagesResponseSchema.parse({ items: [validMessage] });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe(validMessage.id);
  });

  it('falla si items no es un array', () => {
    expect(() => ListTicketMessagesResponseSchema.parse({ items: 'no-array' })).toThrow();
  });
});
