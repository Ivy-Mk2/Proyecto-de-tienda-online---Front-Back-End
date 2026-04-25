import { apiRequest } from '../lib/api/client';
import { Order } from '../types/api';

export type AdminOrder = Order & { user: { name: string; email: string } };
export type AdminOrdersResponse = { data: AdminOrder[]; meta: { page: number; total: number; limit: number } };

export const ordersService = {
  list() {
    return apiRequest<Order[]>('/orders', { auth: true });
  },

  checkout(shippingAddress?: Record<string, string>) {
    return apiRequest<Order>('/orders/checkout', {
      method: 'POST',
      auth: true,
      body: shippingAddress ? { shippingAddress } : undefined,
    });
  },

  adminList(params?: { page?: number; limit?: number }) {
    const q = new URLSearchParams();
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    const qs = q.toString() ? `?${q.toString()}` : '';
    return apiRequest<AdminOrdersResponse>(`/orders/admin${qs}`, { auth: true });
  },
};
