export const apiEndpoints = {
  identity: {
    meVerification: '/identity/me/verification',
  },
  driverLicense: {
    meVerification: '/driver-license/me/verification',
  },
  profile: {
    me: '/profile/me',
  },
  reservations: {
    list: '/reservations',
  },
  vehicles: {
    list: '/vehicle',
  },
} as const;

export type ApiEndpoints = typeof apiEndpoints;