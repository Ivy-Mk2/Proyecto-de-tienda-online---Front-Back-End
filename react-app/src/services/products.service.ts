import { products } from '../data/products';
import type { Product } from '../domain';

export const productsService = {
  getAll(): Product[] {
    return products;
  },

  getById(productId: number): Product | undefined {
    return products.find((product) => product.id === productId);
  },

  getFeatured(limit = 6): Product[] {
    return products.slice(0, limit);
  },
};
