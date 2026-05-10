import { describe, it, expect } from 'vitest';
import { RegisterUserRequestSchema } from '../../src/auth/register';

const valid = {
  name: 'Juan',
  email: 'juan@example.com',
  dni: '12345678',
  phone: '1123456789',
  password: 'Passw0rd!',
};

describe('RegisterUserRequestSchema', () => {
  it('parses valid input', () => {
    const result = RegisterUserRequestSchema.parse(valid);
    expect(result.email).toBe(valid.email);
    expect(result.dni).toBe('12345678');
  });

  it('strips dots from DNI', () => {
    const result = RegisterUserRequestSchema.parse({ ...valid, dni: '12.345.678' });
    expect(result.dni).toBe('12345678');
  });

  it('rejects invalid email', () => {
    expect(() => RegisterUserRequestSchema.parse({ ...valid, email: 'not-email' })).toThrow();
  });

  it('rejects DNI with letters', () => {
    expect(() => RegisterUserRequestSchema.parse({ ...valid, dni: 'abc' })).toThrow();
  });

  it('rejects short password', () => {
    expect(() => RegisterUserRequestSchema.parse({ ...valid, password: '1234' })).toThrow();
  });

  it('rejects password without letters', () => {
    expect(() => RegisterUserRequestSchema.parse({ ...valid, password: '12345678' })).toThrow();
  });

  it('rejects password without numbers', () => {
    expect(() => RegisterUserRequestSchema.parse({ ...valid, password: 'abcdefgh' })).toThrow();
  });

  it('rejects missing name', () => {
    expect(() => RegisterUserRequestSchema.parse({ ...valid, name: '' })).toThrow();
  });
});
