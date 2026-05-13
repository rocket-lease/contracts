import { describe, it, expect } from 'vitest';
import {
  SendOtpRequestSchema,
  VerifyOtpRequestSchema,
  VerifyOtpResponseSchema,
  VerificationStatusResponseSchema,
} from '../../src/auth/verification';

describe('SendOtpRequestSchema', () => {
  it('parses email channel', () => {
    expect(SendOtpRequestSchema.parse({ channel: 'email' }).channel).toBe(
      'email',
    );
  });

  it('parses phone channel', () => {
    expect(SendOtpRequestSchema.parse({ channel: 'phone' }).channel).toBe(
      'phone',
    );
  });

  it('rejects invalid channel', () => {
    expect(() =>
      SendOtpRequestSchema.parse({ channel: 'whatsapp' }),
    ).toThrow();
  });
});

describe('VerifyOtpRequestSchema', () => {
  it('parses valid 6-digit code', () => {
    const r = VerifyOtpRequestSchema.parse({
      channel: 'email',
      code: '123456',
    });
    expect(r.code).toBe('123456');
  });

  it('rejects short code', () => {
    expect(() =>
      VerifyOtpRequestSchema.parse({ channel: 'email', code: '12345' }),
    ).toThrow();
  });

  it('rejects long code', () => {
    expect(() =>
      VerifyOtpRequestSchema.parse({ channel: 'email', code: '1234567' }),
    ).toThrow();
  });

  it('rejects non-digit code', () => {
    expect(() =>
      VerifyOtpRequestSchema.parse({ channel: 'email', code: 'abc123' }),
    ).toThrow();
  });
});

describe('VerifyOtpResponseSchema', () => {
  it('parses verified=true without attemptsLeft', () => {
    const r = VerifyOtpResponseSchema.parse({ verified: true });
    expect(r.verified).toBe(true);
  });

  it('parses verified=false with reason and attemptsLeft', () => {
    const r = VerifyOtpResponseSchema.parse({
      verified: false,
      reason: 'incorrect',
      attemptsLeft: 2,
    });
    expect(r.verified).toBe(false);
    if (!r.verified) {
      expect(r.reason).toBe('incorrect');
      expect(r.attemptsLeft).toBe(2);
    }
  });

  it('rejects verified=false without reason', () => {
    expect(() =>
      VerifyOtpResponseSchema.parse({ verified: false, attemptsLeft: 2 }),
    ).toThrow();
  });

  it('accepts all reason variants', () => {
    for (const reason of ['incorrect', 'expired', 'exhausted', 'not_found']) {
      const r = VerifyOtpResponseSchema.parse({
        verified: false,
        reason,
        attemptsLeft: 0,
      });
      expect(r.verified).toBe(false);
    }
  });
});

describe('VerificationStatusResponseSchema', () => {
  it('parses valid status', () => {
    const r = VerificationStatusResponseSchema.parse({
      email: true,
      phone: false,
    });
    expect(r.email).toBe(true);
    expect(r.phone).toBe(false);
  });

  it('rejects non-boolean', () => {
    expect(() =>
      VerificationStatusResponseSchema.parse({ email: 'true', phone: false }),
    ).toThrow();
  });
});
