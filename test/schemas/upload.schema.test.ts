import { describe, it, expect } from 'vitest';
import { UploadSignRequestSchema, UploadSignResponseSchema } from '../../src/schemas/upload.schema';

describe('UploadSignRequestSchema', () => {
  it('accepts empty object', () => {
    expect(UploadSignRequestSchema.parse({})).toEqual({});
  });

  it('accepts valid resourceType and folder', () => {
    const result = UploadSignRequestSchema.parse({
      resourceType: 'image',
      folder: 'rocket-lease/vehicle-photos',
    });
    expect(result.resourceType).toBe('image');
    expect(result.folder).toBe('rocket-lease/vehicle-photos');
  });

  it('rejects unknown resourceType', () => {
    expect(() => UploadSignRequestSchema.parse({ resourceType: 'pdf' })).toThrow();
  });
});

describe('UploadSignResponseSchema', () => {
  it('accepts valid response', () => {
    const result = UploadSignResponseSchema.parse({
      uploadUrl: 'https://api.cloudinary.com/v1_1/mycloud/image/upload',
      fields: {
        api_key: '123',
        timestamp: '1716000000',
        signature: 'abc',
        folder: 'rocket-lease/vehicle-photos',
      },
    });
    expect(result.uploadUrl).toBe('https://api.cloudinary.com/v1_1/mycloud/image/upload');
    expect(result.fields.api_key).toBe('123');
  });

  it('rejects non-url uploadUrl', () => {
    expect(() =>
      UploadSignResponseSchema.parse({ uploadUrl: 'not-a-url', fields: {} }),
    ).toThrow();
  });

  it('accepts empty fields', () => {
    const result = UploadSignResponseSchema.parse({
      uploadUrl: 'https://api.example.com/upload',
      fields: {},
    });
    expect(result.fields).toEqual({});
  });
});
