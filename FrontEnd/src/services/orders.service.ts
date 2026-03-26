import { apiRequest } from '../lib/api/client';
import { Order } from '../types/api';

export const ordersService = {
  list() {
    return apiRequest<Order[]>('/orders', { auth: true });
  },

  checkout() {
    return apiRequest<Order>('/orders/checkout', { method: 'POST', auth: true });
  },
};
