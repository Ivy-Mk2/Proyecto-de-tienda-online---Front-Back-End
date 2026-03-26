import { Product } from '../types/api';
import { apiRequest } from '../lib/api/client';

export const productsService = {
  list() {
    return apiRequest<Product[]>('/products');
  },

  listFeatured() {
    return apiRequest<Product[]>('/products?featured=true&isActive=true');
  },
};
