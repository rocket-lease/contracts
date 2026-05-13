import { describe, it, expect } from 'vitest';
import {
  AddFavoriteRequestSchema,
  AddFavoriteResponseSchema,
  FavoriteItemSchema,
  ListFavoritesResponseSchema,
} from '../../src/schemas/favorite.schema';
import { randomUUID } from 'crypto';

const vehicleId = randomUUID();
const conductorId = randomUUID();
const favoriteId = randomUUID();
const now = new Date().toISOString();

describe('AddFavoriteRequestSchema', () => {
  it('parsea vehicleId UUID válido', () => {
    const result = AddFavoriteRequestSchema.parse({ vehicleId });
    expect(result.vehicleId).toBe(vehicleId);
  });

  it('rechaza vehicleId con formato inválido', () => {
    expect(() => AddFavoriteRequestSchema.parse({ vehicleId: 'no-es-uuid' })).toThrow();
  });

  it('rechaza request sin vehicleId', () => {
    expect(() => AddFavoriteRequestSchema.parse({})).toThrow();
  });

  it('rechaza vehicleId vacío', () => {
    expect(() => AddFavoriteRequestSchema.parse({ vehicleId: '' })).toThrow();
  });
});

describe('AddFavoriteResponseSchema', () => {
  const valid = { id: favoriteId, vehicleId, conductorId, createdAt: now };

  it('parsea respuesta válida', () => {
    const result = AddFavoriteResponseSchema.parse(valid);
    expect(result.id).toBe(favoriteId);
    expect(result.vehicleId).toBe(vehicleId);
    expect(result.conductorId).toBe(conductorId);
  });

  it('rechaza id con formato inválido', () => {
    expect(() => AddFavoriteResponseSchema.parse({ ...valid, id: 'bad' })).toThrow();
  });

  it('rechaza createdAt con formato inválido', () => {
    expect(() => AddFavoriteResponseSchema.parse({ ...valid, createdAt: '01/01/2024' })).toThrow();
  });

  it('rechaza respuesta sin conductorId', () => {
    const { conductorId: _, ...without } = valid;
    expect(() => AddFavoriteResponseSchema.parse(without)).toThrow();
  });
});

describe('FavoriteItemSchema', () => {
  const valid = { id: favoriteId, vehicleId, createdAt: now };

  it('parsea item válido', () => {
    const result = FavoriteItemSchema.parse(valid);
    expect(result.vehicleId).toBe(vehicleId);
  });

  it('rechaza item sin id', () => {
    const { id: _, ...without } = valid;
    expect(() => FavoriteItemSchema.parse(without)).toThrow();
  });

  it('rechaza createdAt no ISO 8601', () => {
    expect(() => FavoriteItemSchema.parse({ ...valid, createdAt: 'ayer' })).toThrow();
  });
});

describe('ListFavoritesResponseSchema', () => {
  it('parsea lista vacía', () => {
    const result = ListFavoritesResponseSchema.parse({ items: [] });
    expect(result.items).toHaveLength(0);
  });

  it('parsea lista con un item', () => {
    const result = ListFavoritesResponseSchema.parse({
      items: [{ id: favoriteId, vehicleId, createdAt: now }],
    });
    expect(result.items).toHaveLength(1);
    expect(result.items[0].vehicleId).toBe(vehicleId);
  });

  it('rechaza si items no es array', () => {
    expect(() => ListFavoritesResponseSchema.parse({ items: null })).toThrow();
  });

  it('rechaza si falta el campo items', () => {
    expect(() => ListFavoritesResponseSchema.parse({})).toThrow();
  });

  it('rechaza item con vehicleId inválido dentro de la lista', () => {
    expect(() =>
      ListFavoritesResponseSchema.parse({
        items: [{ id: favoriteId, vehicleId: 'malformado', createdAt: now }],
      }),
    ).toThrow();
  });
});
