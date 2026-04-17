import { useCallback, useEffect, useMemo, useState } from 'react';
import { cartService } from '../../../services/cart.service';
import { favoritesService } from '../../../services/favorites.service';
import { productService } from '../../../services/products.service';
import { Product } from '../../../types/api';
import { getApiErrorMessage } from '../../../hooks/useApiError';

type UseFeaturedOptions = {
  isAuthenticated: boolean;
};

export const useFeatured = ({ isAuthenticated }: UseFeaturedOptions) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const loadFeatured = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const featuredProducts = await productService.getFeaturedProducts();
      setProducts(featuredProducts);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeatured();
  }, [loadFeatured]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        setFavoriteIds([]);
        return;
      }

      try {
        const favorites = await favoritesService.list();
        setFavoriteIds(favorites.map((favorite) => favorite.productId));
      } catch {
        setFavoriteIds([]);
      }
    };

    void loadFavorites();
  }, [isAuthenticated]);

  const skeletonItems = useMemo(
    () => Array.from({ length: 6 }, (_, index) => `skeleton-${index}`),
    [],
  );

  const addToCart = useCallback(
    async (productId: string) => {
      try {
        await cartService.addItem({
          productId,
          quantity: 1,
          isAuthenticated,
        });
      } catch {
        // Acción secundaria: no rompe la vista principal.
      }
    },
    [isAuthenticated],
  );

  const toggleFavorite = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) return;

      const isFavorite = favoriteIds.includes(productId);

      setFavoriteIds((prev) =>
        isFavorite
          ? prev.filter((favoriteId) => favoriteId !== productId)
          : [...prev, productId],
      );

      try {
        if (isFavorite) await favoritesService.remove(productId);
        else await favoritesService.add(productId);
      } catch {
        setFavoriteIds((prev) =>
          isFavorite
            ? [...prev, productId]
            : prev.filter((favoriteId) => favoriteId !== productId),
        );
      }
    },
    [favoriteIds, isAuthenticated],
  );

  return {
    products,
    loading,
    error,
    favoriteIds,
    skeletonItems,
    loadFeatured,
    addToCart,
    toggleFavorite,
  };
};
