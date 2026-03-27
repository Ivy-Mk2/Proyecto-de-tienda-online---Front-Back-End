import { useCallback, useEffect, useState } from 'react';
import { cartService } from '../services/cart.service';
import { favoritesService } from '../services/favorites.service';
import { productsService } from '../services/products.service';
import { getApiErrorMessage } from './useApiError';

type HeaderData = {
  cartCount: number;
  favoritesCount: number;
  categories: string[];
};

const INITIAL_DATA: HeaderData = {
  cartCount: 0,
  favoritesCount: 0,
  categories: [],
};

export const useHeaderData = (isAuthenticated: boolean) => {
  const [data, setData] = useState<HeaderData>(INITIAL_DATA);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [cart, favorites, products] = await Promise.all([
        cartService.getCart(isAuthenticated),
        isAuthenticated ? favoritesService.list() : Promise.resolve([]),
        productsService.list(),
      ]);

      const cartCount = cart.items.reduce((total, item) => total + item.quantity, 0);
      const categories = Array.from(
        new Set(products.map((product) => product.category).filter(Boolean)),
      ).slice(0, 6);

      setData({
        cartCount,
        favoritesCount: favorites.length,
        categories,
      });
    } catch (err) {
      setData(INITIAL_DATA);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    ...data,
    loading,
    error,
    refresh: load,
  };
};
