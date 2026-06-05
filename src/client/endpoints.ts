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
  pricing: {
    quote: '/pricing/quote',
  },
  reservations: {
    list: '/reservations',
    cancel: (id: string) => `/reservations/${id}/cancel`,
    confirmPickup: (id: string) => `/reservations/${id}/pickup`,
    verifyVoucher: (token: string) => `/reservations/voucher/${token}`,
    payBalance: (id: string) => `/reservations/${id}/balance`,
    balanceTransfer: (id: string) => `/reservations/${id}/balance/transfer`,
    balanceTransferConfirm: (id: string) =>
      `/reservations/${id}/balance/transfer/confirm`,
  },
  reviews: {
    mine: '/reviews/rentador/mine',
    create: (reservationId: string) => `/reservations/${reservationId}/review`,
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
  admin: {
    pricingZones: '/admin/pricing/zones',
  },
} as const;

export type ApiEndpoints = typeof apiEndpoints;