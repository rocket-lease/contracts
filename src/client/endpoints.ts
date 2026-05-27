export const apiEndpoints = {
  identity: {
    meVerification: '/identity/me/verification',
  },
  profile: {
    me: '/profile/me',
  },
  reservations: {
    list: '/reservations',
  },
  vehicles: {
    list: '/vehicle',
    documentsSubmit: (id: string) => `/vehicle/${id}/documents`,
    documentsStatus: (id: string) => `/vehicle/${id}/documents/status`,
    documentsRequired: (id: string) => `/vehicle/${id}/documents/required`,
    documentsProcess: '/vehicle/documents/process',
  },
} as const;

export type ApiEndpoints = typeof apiEndpoints;