import { productsService } from '../services/products.service';

export const useProducts = () => {
  const allProducts = productsService.getAll();

  return {
    products: allProducts,
    featuredProducts: productsService.getFeatured(),
    getProductById: productsService.getById,
  };
};
