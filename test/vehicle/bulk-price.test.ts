import { describe, it, expect } from 'vitest';
import {
  BulkPriceOperationSchema,
  BulkPriceUpdateRequestSchema,
  BulkPriceUpdateResponseSchema,
  ActiveReservationsCountRequestSchema,
  ActiveReservationsCountResponseSchema,
} from '../../src/vehicle/bulk-price';

const uuid = '00000000-0000-0000-0000-000000000001';
const uuid2 = '00000000-0000-0000-0000-000000000002';

describe('BulkPriceOperationSchema', () => {
  describe('SET', () => {
    it('parsea valueCents=1', () => {
      expect(BulkPriceOperationSchema.parse({ type: 'SET', valueCents: 1 })).toEqual({ type: 'SET', valueCents: 1 });
    });

    it('parsea valueCents=100000', () => {
      expect(BulkPriceOperationSchema.parse({ type: 'SET', valueCents: 100000 })).toEqual({ type: 'SET', valueCents: 100000 });
    });

    it('rechaza valueCents=0', () => {
      expect(() => BulkPriceOperationSchema.parse({ type: 'SET', valueCents: 0 })).toThrow();
    });

    it('rechaza valueCents negativo', () => {
      expect(() => BulkPriceOperationSchema.parse({ type: 'SET', valueCents: -500 })).toThrow();
    });

    it('rechaza valueCents decimal', () => {
      expect(() => BulkPriceOperationSchema.parse({ type: 'SET', valueCents: 1.5 })).toThrow();
    });
  });

  describe('PERCENTAGE', () => {
    it('parsea delta=-90', () => {
      expect(BulkPriceOperationSchema.parse({ type: 'PERCENTAGE', delta: -90 })).toEqual({ type: 'PERCENTAGE', delta: -90 });
    });

    it('parsea delta=0', () => {
      expect(BulkPriceOperationSchema.parse({ type: 'PERCENTAGE', delta: 0 })).toEqual({ type: 'PERCENTAGE', delta: 0 });
    });

    it('parsea delta=15', () => {
      expect(BulkPriceOperationSchema.parse({ type: 'PERCENTAGE', delta: 15 })).toEqual({ type: 'PERCENTAGE', delta: 15 });
    });

    it('parsea delta=1000', () => {
      expect(BulkPriceOperationSchema.parse({ type: 'PERCENTAGE', delta: 1000 })).toEqual({ type: 'PERCENTAGE', delta: 1000 });
    });

    it('rechaza delta=-91', () => {
      expect(() => BulkPriceOperationSchema.parse({ type: 'PERCENTAGE', delta: -91 })).toThrow();
    });

    it('rechaza delta=1001', () => {
      expect(() => BulkPriceOperationSchema.parse({ type: 'PERCENTAGE', delta: 1001 })).toThrow();
    });

    it('rechaza delta no entero', () => {
      expect(() => BulkPriceOperationSchema.parse({ type: 'PERCENTAGE', delta: 10.5 })).toThrow();
    });
  });
});

describe('BulkPriceUpdateRequestSchema', () => {
  it('parsea con 1 vehicleId', () => {
    const result = BulkPriceUpdateRequestSchema.parse({
      vehicleIds: [uuid],
      operation: { type: 'SET', valueCents: 5000 },
    });
    expect(result.vehicleIds).toHaveLength(1);
  });

  it('parsea con 100 vehicleIds', () => {
    const ids = Array.from({ length: 100 }, (_, i) =>
      `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
    );
    expect(() => BulkPriceUpdateRequestSchema.parse({
      vehicleIds: ids,
      operation: { type: 'SET', valueCents: 100 },
    })).not.toThrow();
  });

  it('rechaza vehicleIds vacío', () => {
    expect(() => BulkPriceUpdateRequestSchema.parse({
      vehicleIds: [],
      operation: { type: 'SET', valueCents: 5000 },
    })).toThrow();
  });

  it('rechaza más de 100 vehicleIds', () => {
    const ids = Array.from({ length: 101 }, (_, i) =>
      `00000000-0000-0000-0000-${String(i + 1).padStart(12, '0')}`,
    );
    expect(() => BulkPriceUpdateRequestSchema.parse({
      vehicleIds: ids,
      operation: { type: 'SET', valueCents: 5000 },
    })).toThrow();
  });

  it('rechaza si algún id no es UUID', () => {
    expect(() => BulkPriceUpdateRequestSchema.parse({
      vehicleIds: ['not-a-uuid'],
      operation: { type: 'SET', valueCents: 5000 },
    })).toThrow();
  });
});

describe('BulkPriceUpdateResponseSchema', () => {
  it('parsea respuesta válida', () => {
    const result = BulkPriceUpdateResponseSchema.parse({
      updated: [{ id: uuid, previousPriceCents: 1000, newPriceCents: 1150 }],
    });
    expect(result.updated).toHaveLength(1);
    expect(result.updated[0]?.newPriceCents).toBe(1150);
  });

  it('parsea respuesta con lista vacía', () => {
    const result = BulkPriceUpdateResponseSchema.parse({ updated: [] });
    expect(result.updated).toHaveLength(0);
  });
});

describe('ActiveReservationsCountRequestSchema', () => {
  it('parsea con UUIDs válidos', () => {
    const result = ActiveReservationsCountRequestSchema.parse({ vehicleIds: [uuid, uuid2] });
    expect(result.vehicleIds).toHaveLength(2);
  });

  it('rechaza UUIDs inválidos', () => {
    expect(() => ActiveReservationsCountRequestSchema.parse({ vehicleIds: ['bad-id'] })).toThrow();
  });

  it('rechaza array vacío', () => {
    expect(() => ActiveReservationsCountRequestSchema.parse({ vehicleIds: [] })).toThrow();
  });
});

describe('ActiveReservationsCountResponseSchema', () => {
  it('parsea counts con keys UUID válidas', () => {
    const result = ActiveReservationsCountResponseSchema.parse({
      counts: { [uuid]: 2, [uuid2]: 0 },
    });
    expect(result.counts[uuid]).toBe(2);
    expect(result.counts[uuid2]).toBe(0);
  });
});
