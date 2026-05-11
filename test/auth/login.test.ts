import { describe, it, expect } from 'vitest';
import { LoginUserRequestSchema, LoginUserResponseSchema } from '../../src/auth/login';

const validRequest = {
  email: 'juan@example.com',
  password: 'Passw0rd!',
};

describe('LoginUserRequestSchema', () => {
  it('parses valid input', () => {
    const result = LoginUserRequestSchema.parse(validRequest);
    expect(result.email).toBe(validRequest.email);
    expect(result.password).toBe(validRequest.password);
  });

  it('rejects invalid email', () => {
    expect(() => LoginUserRequestSchema.parse({ ...validRequest, email: 'not-email' })).toThrow();
  });

  it('rejects empty email', () => {
    expect(() => LoginUserRequestSchema.parse({ ...validRequest, email: '' })).toThrow();
  });

  it('rejects short password', () => {
    expect(() => LoginUserRequestSchema.parse({ ...validRequest, password: 'Ab1' })).toThrow();
  });

  it('rejects password without letters', () => {
    expect(() => LoginUserRequestSchema.parse({ ...validRequest, password: '12345678' })).toThrow();
  });

  it('rejects password without numbers', () => {
    expect(() => LoginUserRequestSchema.parse({ ...validRequest, password: 'abcdefgh' })).toThrow();
  });

  it('rejects missing email', () => {
    const { email: _, ...withoutEmail } = validRequest;
    expect(() => LoginUserRequestSchema.parse(withoutEmail)).toThrow();
  });

  it('rejects missing password', () => {
    const { password: _, ...withoutPassword } = validRequest;
    expect(() => LoginUserRequestSchema.parse(withoutPassword)).toThrow();
  });
});

describe('LoginUserResponseSchema', () => {
  const validResponse = {
    access_token: 'eyJhbGciOiJIUzI1NiJ9.payload.signature',
    refresh_token: 'eyJhbGciOiJIUzI1NiJ9.refresh.signature',
    expires_in: 3600,
  };

  it('parses valid response', () => {
    const result = LoginUserResponseSchema.parse(validResponse);
    expect(result.access_token).toBe(validResponse.access_token);
    expect(result.refresh_token).toBe(validResponse.refresh_token);
    expect(result.expires_in).toBe(3600);
  });

  it('rejects missing access_token', () => {
    const { access_token: _, ...rest } = validResponse;
    expect(() => LoginUserResponseSchema.parse(rest)).toThrow();
  });

  it('rejects missing refresh_token', () => {
    const { refresh_token: _, ...rest } = validResponse;
    expect(() => LoginUserResponseSchema.parse(rest)).toThrow();
  });

  it('rejects missing expires_in', () => {
    const { expires_in: _, ...rest } = validResponse;
    expect(() => LoginUserResponseSchema.parse(rest)).toThrow();
  });

  it('rejects non-numeric expires_in', () => {
    expect(() => LoginUserResponseSchema.parse({ ...validResponse, expires_in: '3600' })).toThrow();
  });
});
