import { describe, expect, it } from 'vitest';
import {
  BankAccountIdentifierSchema,
  BankAccountCbuSchema,
  BankAccountListResponseSchema,
  BankAccountSchema,
  CreateBankAccountRequestSchema,
} from '../../src/bank-account/bank-account';

const validUuid = '018f8b3c-4d0e-7000-8000-000000000001';

const validAccount = {
  id: validUuid,
  ownerId: validUuid,
  provider: 'stub-bank-provider',
  alias: 'mi.cbu.alias',
  cbu: '2850590940090418135201',
  maskedCbu: '2850**************5201',
  isActive: true,
  isVerified: true,
  deletedAt: null,
  createdAt: '2026-05-24T10:00:00.000Z',
  updatedAt: '2026-05-24T10:00:00.000Z',
};

describe('BankAccountIdentifierSchema', () => {
  it('parses a valid identifier', () => {
    expect(BankAccountIdentifierSchema.parse('mi cuenta personal')).toBe('mi cuenta personal');
  });

  it('rejects short identifiers', () => {
    expect(() => BankAccountIdentifierSchema.parse('ab')).toThrow();
  });
});

describe('BankAccountCbuSchema', () => {
  it('parses a valid CBU', () => {
    expect(BankAccountCbuSchema.parse(validAccount.cbu)).toBe(validAccount.cbu);
  });

  it('rejects non numeric CBU', () => {
    expect(() => BankAccountCbuSchema.parse('2850abc')).toThrow();
  });
});

describe('BankAccountSchema', () => {
  it('parses a valid account', () => {
    expect(BankAccountSchema.parse(validAccount).maskedCbu).toBe(validAccount.maskedCbu);
  });

  it('rejects invalid masked cbu', () => {
    expect(() =>
      BankAccountSchema.parse({ ...validAccount, maskedCbu: validAccount.cbu }),
    ).toThrow();
  });
});

describe('BankAccount request schemas', () => {
  it('parse create request', () => {
    const payload = CreateBankAccountRequestSchema.parse({
      alias: 'mi cuenta personal',
      cbu: validAccount.cbu,
    });
    expect(payload.alias).toBe('mi cuenta personal');
  });
});

describe('BankAccountListResponseSchema', () => {
  it('parses a list of accounts', () => {
    const list = BankAccountListResponseSchema.parse([validAccount]);
    expect(list).toHaveLength(1);
  });
});