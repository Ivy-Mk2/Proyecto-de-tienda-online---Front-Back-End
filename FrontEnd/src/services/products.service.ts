import { Product } from '../types/api';
import { apiRequest } from '../lib/api/client';

const buildQuery = (params: Record<string, string | undefined>) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (!value) return;
    searchParams.set(key, value);
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const productsService = {
  list(filters?: { category?: string }) {
    const query = buildQuery({ category: filters?.category, isActive: 'true' });
    return apiRequest<Product[]>(`/products${query}`);
  },

  listFeatured() {
    return apiRequest<Product[]>('/products?featured=true&isActive=true');
  },
};
