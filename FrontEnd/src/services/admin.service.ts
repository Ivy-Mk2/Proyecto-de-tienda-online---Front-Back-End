import { apiRequest } from '../lib/api/client';
import { Product, Banner, PaginatedOrders } from '../types/api';

type CreateProductBody = {
  name: string;
  description: string;
  price: string;
  stock: number;
  category: string;
  sizes: string[];
  colors: string[];
  featured: boolean;
};

export const adminProductsService = {
  list() {
    return apiRequest<Product[]>('/products?isActive=true', { auth: true });
  },
  create(data: CreateProductBody) {
    return apiRequest<Product>('/products', { method: 'POST', auth: true, body: data });
  },
  update(id: string, data: Partial<CreateProductBody>) {
    return apiRequest<Product>(`/products/${id}`, { method: 'PATCH', auth: true, body: data });
  },
  remove(id: string) {
    return apiRequest<void>(`/products/${id}`, { method: 'DELETE', auth: true });
  },
};

export const adminBannersService = {
  list() {
    return apiRequest<Banner[]>('/banners', { auth: true });
  },
  remove(id: string) {
    return apiRequest<void>(`/banners/${id}`, { method: 'DELETE', auth: true });
  },
};

export const adminOrdersService = {
  list({ page = 1, limit = 20 }: { page?: number; limit?: number } = {}) {
    return apiRequest<PaginatedOrders>(`/orders/admin?page=${page}&limit=${limit}`, { auth: true });
  },
};
