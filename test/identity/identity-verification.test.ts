import { describe, expect, it } from 'vitest';
import {
  IdentityVerificationDocumentsSchema,
  IdentityVerificationSummarySchema,
  SubmitIdentityVerificationRequestSchema,
} from '../../src/identity/identity-verification';

const validDocument = {
  fileName: 'dni-front.jpg',
  mimeType: 'image/jpeg',
  dataUrl: 'data:image/jpeg;base64,ZmFrZQ==',
};

describe('IdentityVerificationDocumentsSchema', () => {
  it('parses a full identity payload', () => {
    const parsed = IdentityVerificationDocumentsSchema.parse({
      frontDni: validDocument,
      backDni: { ...validDocument, fileName: 'dni-back.jpg' },
      selfie: { ...validDocument, fileName: 'selfie.jpg' },
    });

    expect(parsed.selfie.fileName).toBe('selfie.jpg');
  });

  it('rejects missing selfie', () => {
    expect(() =>
      IdentityVerificationDocumentsSchema.parse({
        frontDni: validDocument,
        backDni: validDocument,
      }),
    ).toThrow();
  });
});

describe('SubmitIdentityVerificationRequestSchema', () => {
  it('parses the submit request', () => {
    expect(
      SubmitIdentityVerificationRequestSchema.parse({
        frontDni: validDocument,
        backDni: { ...validDocument, fileName: 'dni-back.jpg' },
        selfie: { ...validDocument, fileName: 'selfie.jpg' },
      }).frontDni.fileName,
    ).toBe('dni-front.jpg');
  });
});

describe('IdentityVerificationSummarySchema', () => {
  it('parses a pending summary', () => {
    const summary = IdentityVerificationSummarySchema.parse({
      status: 'pending',
      providerName: 'stub-identity-provider',
      providerRequestId: 'req-123',
      rejectionReason: null,
      submittedAt: '2026-05-25T12:00:00.000Z',
      reviewAfterAt: '2026-05-25T12:00:30.000Z',
      reviewedAt: null,
      verifiedAt: null,
    });

    expect(summary.status).toBe('pending');
  });

  it('parses a rejected summary with reason', () => {
    const summary = IdentityVerificationSummarySchema.parse({
      status: 'rejected',
      providerName: 'stub-identity-provider',
      providerRequestId: 'req-123',
      rejectionReason: 'Documento ilegible',
      submittedAt: '2026-05-25T12:00:00.000Z',
      reviewAfterAt: '2026-05-25T12:00:30.000Z',
      reviewedAt: '2026-05-25T12:00:30.000Z',
      verifiedAt: null,
    });

    expect(summary.rejectionReason).toBe('Documento ilegible');
  });
});