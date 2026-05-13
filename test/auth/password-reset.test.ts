import { describe, it, expect } from 'vitest';
import {
  ForgotPasswordRequestSchema,
  ResetPasswordRequestSchema,
} from '../../src/auth/password-reset';

describe('ForgotPasswordRequestSchema', () => {
  it('parses valid email', () => {
    const result = ForgotPasswordRequestSchema.parse({ email: 'juan@example.com' });
    expect(result.email).toBe('juan@example.com');
  });

  it('rejects invalid email', () => {
    expect(() => ForgotPasswordRequestSchema.parse({ email: 'not-email' })).toThrow();
  });

  it('rejects missing email', () => {
    expect(() => ForgotPasswordRequestSchema.parse({})).toThrow();
  });
});

describe('ResetPasswordRequestSchema', () => {
  const valid = {
    accessToken: 'eyJhbGciOiJIUzI1NiJ9.payload.signature',
    newPassword: 'Newp4ss!',
  };

  it('parses valid input', () => {
    const result = ResetPasswordRequestSchema.parse(valid);
    expect(result.accessToken).toBe(valid.accessToken);
    expect(result.newPassword).toBe(valid.newPassword);
  });

  it('rejects empty accessToken', () => {
    expect(() => ResetPasswordRequestSchema.parse({ ...valid, accessToken: '' })).toThrow();
  });

  it('rejects short newPassword', () => {
    expect(() => ResetPasswordRequestSchema.parse({ ...valid, newPassword: 'Ab1' })).toThrow();
  });

  it('rejects newPassword without letters', () => {
    expect(() => ResetPasswordRequestSchema.parse({ ...valid, newPassword: '12345678' })).toThrow();
  });

  it('rejects newPassword without numbers', () => {
    expect(() => ResetPasswordRequestSchema.parse({ ...valid, newPassword: 'abcdefgh' })).toThrow();
  });

  it('rejects missing accessToken', () => {
    const { accessToken: _, ...rest } = valid;
    expect(() => ResetPasswordRequestSchema.parse(rest)).toThrow();
  });

  it('rejects missing newPassword', () => {
    const { newPassword: _, ...rest } = valid;
    expect(() => ResetPasswordRequestSchema.parse(rest)).toThrow();
  });
});
