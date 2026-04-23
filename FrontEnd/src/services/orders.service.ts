import { apiRequest } from '../lib/api/client';
import { Order, ShippingAddress } from '../types/api';

export const ordersService = {
  list() {
    return apiRequest<Order[]>('/orders', { auth: true });
  },

  checkout(shippingAddress?: ShippingAddress) {
    return apiRequest<Order>('/orders/checkout', {
      method: 'POST',
      auth: true,
      body: shippingAddress ? { shippingAddress } : {},
    });
  },
};
