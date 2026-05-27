import { describe, expect, it } from 'vitest';
import {
  DriverLicenseVerificationDocumentsSchema,
  DriverLicenseVerificationSummarySchema,
  SubmitDriverLicenseVerificationRequestSchema,
} from '../../src/driver-license/driver-license-verification';

const validDocument = {
  fileName: 'license-front.jpg',
  mimeType: 'image/jpeg',
  dataUrl: 'data:image/jpeg;base64,ZmFrZQ==',
};

describe('DriverLicenseVerificationDocumentsSchema', () => {
  it('parses a full driver license payload', () => {
    const parsed = DriverLicenseVerificationDocumentsSchema.parse({
      frontLicense: validDocument,
      selfie: { ...validDocument, fileName: 'selfie.jpg' },
    });

    expect(parsed.frontLicense.fileName).toBe('license-front.jpg');
  });

  it('rejects missing frontLicense', () => {
    expect(() =>
      DriverLicenseVerificationDocumentsSchema.parse({
        selfie: validDocument,
      }),
    ).toThrow();
  });
});

describe('SubmitDriverLicenseVerificationRequestSchema', () => {
  it('parses the submit request', () => {
    expect(
      SubmitDriverLicenseVerificationRequestSchema.parse({
        frontLicense: validDocument,
        selfie: { ...validDocument, fileName: 'selfie.jpg' },
      }).selfie.fileName,
    ).toBe('selfie.jpg');
  });
});

describe('DriverLicenseVerificationSummarySchema', () => {
  it('parses a pending summary', () => {
    const summary = DriverLicenseVerificationSummarySchema.parse({
      status: 'pending',
      providerName: 'stub-driver-license-provider',
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
    const summary = DriverLicenseVerificationSummarySchema.parse({
      status: 'rejected',
      providerName: 'stub-driver-license-provider',
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