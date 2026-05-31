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
  wallet: {
    balance: '/wallet/balance',
    transactions: '/wallet/transactions',
    withdraw: '/wallet/withdrawals',
  },
  reservations: {
    list: '/reservations',
    cancel: (id: string) => `/reservations/${id}/cancel`,
    confirmPickup: (id: string) => `/reservations/${id}/pickup`,
    verifyVoucher: (token: string) => `/reservations/voucher/${token}`,
  },
  vehicles: {
    list: '/vehicle',
    documentsSubmit: (id: string) => `/vehicle/${id}/documents`,
    documentsStatus: (id: string) => `/vehicle/${id}/documents/status`,
    documentsRequired: (id: string) => `/vehicle/${id}/documents/required`,
    documentsProcess: '/vehicle/documents/process',
  },
  pushSubscriptions: {
    register: '/push-subscriptions',
    unregister: '/push-subscriptions',
    vapidKey: '/push-subscriptions/vapid-key',
  },
} as const;

export type ApiEndpoints = typeof apiEndpoints;