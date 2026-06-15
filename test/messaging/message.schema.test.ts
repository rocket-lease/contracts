import { describe, it, expect } from 'vitest';
import {
  MessageSchema,
  SendMessageRequestSchema,
  ListMessagesResponseSchema,
  MarkReadBodySchema,
} from '../../src/messaging/message.schema';

const validMessage = {
  id: '00000000-0000-0000-0000-000000000001',
  reservationId: '00000000-0000-0000-0000-000000000002',
  senderId: 'user-abc',
  body: 'Hola, ¿a qué hora paso a buscar el auto?',
  sentAt: '2026-05-24T10:00:00.000Z',
};

describe('MessageSchema', () => {
  it('parsea un mensaje válido', () => {
    const result = MessageSchema.parse(validMessage);
    expect(result.id).toBe(validMessage.id);
    expect(result.body).toBe(validMessage.body);
  });

  it('falla si body está vacío', () => {
    expect(() => MessageSchema.parse({ ...validMessage, body: '' })).toThrow();
  });

  it('falla si body tiene solo espacios (trim colapsa a vacío)', () => {
    expect(() => MessageSchema.parse({ ...validMessage, body: '   ' })).toThrow();
  });

  it('falla si body supera 1000 caracteres', () => {
    expect(() =>
      MessageSchema.parse({ ...validMessage, body: 'a'.repeat(1001) }),
    ).toThrow();
  });

  it('acepta body de exactamente 1000 caracteres', () => {
    const result = MessageSchema.parse({ ...validMessage, body: 'a'.repeat(1000) });
    expect(result.body).toHaveLength(1000);
  });

  it('falla si falta reservationId', () => {
    const { reservationId: _, ...rest } = validMessage;
    expect(() => MessageSchema.parse(rest)).toThrow();
  });

  it('falla si sentAt no es datetime ISO válido', () => {
    expect(() =>
      MessageSchema.parse({ ...validMessage, sentAt: 'no-es-fecha' }),
    ).toThrow();
  });
});

describe('SendMessageRequestSchema', () => {
  it('parsea un body válido', () => {
    const result = SendMessageRequestSchema.parse({ body: 'Hola' });
    expect(result.body).toBe('Hola');
  });

  it('rechaza body vacío', () => {
    expect(() => SendMessageRequestSchema.parse({ body: '' })).toThrow();
  });

  it('rechaza body de solo espacios', () => {
    expect(() => SendMessageRequestSchema.parse({ body: '   ' })).toThrow();
  });

  it('rechaza body de más de 1000 caracteres', () => {
    expect(() =>
      SendMessageRequestSchema.parse({ body: 'x'.repeat(1001) }),
    ).toThrow();
  });
});

describe('ListMessagesResponseSchema', () => {
  it('parsea lista vacía con lastSeenAt null', () => {
    const result = ListMessagesResponseSchema.parse({ items: [], lastSeenAt: null });
    expect(result.items).toHaveLength(0);
    expect(result.lastSeenAt).toBeNull();
  });

  it('parsea lista con mensajes y lastSeenAt', () => {
    const result = ListMessagesResponseSchema.parse({
      items: [validMessage],
      lastSeenAt: '2026-06-14T10:00:00.000Z',
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0]?.id).toBe(validMessage.id);
    expect(result.lastSeenAt).toBe('2026-06-14T10:00:00.000Z');
  });

  it('falla si items no es un array', () => {
    expect(() =>
      ListMessagesResponseSchema.parse({ items: 'no-array', lastSeenAt: null }),
    ).toThrow();
  });

  it('falla si lastSeenAt no es datetime ISO válido', () => {
    expect(() =>
      ListMessagesResponseSchema.parse({ items: [], lastSeenAt: 'no-es-fecha' }),
    ).toThrow();
  });
});

describe('MarkReadBodySchema', () => {
  it('parsea un lastReadAt válido', () => {
    const result = MarkReadBodySchema.parse({ lastReadAt: '2026-06-14T10:00:00.000Z' });
    expect(result.lastReadAt).toBe('2026-06-14T10:00:00.000Z');
  });

  it('falla si lastReadAt no es datetime ISO válido', () => {
    expect(() => MarkReadBodySchema.parse({ lastReadAt: 'no-es-fecha' })).toThrow();
  });

  it('falla si falta lastReadAt', () => {
    expect(() => MarkReadBodySchema.parse({})).toThrow();
  });
});
