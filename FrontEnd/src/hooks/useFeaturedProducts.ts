import { useEffect, useState } from 'react';
import { getApiErrorMessage } from './useApiError';
import { productsService } from '../services/products.service';
import { Product } from '../types/api';

export const useFeaturedProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        setProducts(await productsService.listFeatured());
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  return { products, loading, error };
};
