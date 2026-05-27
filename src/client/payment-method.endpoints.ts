export const PaymentMethodEndpoints = {
  list: () => '/profile/payment-methods' as const,
  create: () => '/profile/payment-methods' as const,
  update: (id: string) => `/profile/payment-methods/${id}` as const,
  delete: (id: string) => `/profile/payment-methods/${id}` as const,
};
