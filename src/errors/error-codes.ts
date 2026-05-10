export const ErrorCodes = {
  ENTITY_ALREADY_EXISTS: 'ENTITY_ALREADY_EXISTS',
  INVALID_ENTITY_DATA: 'INVALID_ENTITY_DATA',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
