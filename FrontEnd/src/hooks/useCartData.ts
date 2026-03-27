import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/cart.service';
import { getApiErrorMessage } from './useApiError';
import type { Cart, CartItem } from '../types/api';

const parsePrice = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const useCartData = () => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const nextCart = await cartService.getCart(isAuthenticated);
      setCart(nextCart);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    void loadCart();
  }, [loadCart]);

  useEffect(() => {
    const unsubscribe = cartService.subscribeCartUpdates(() => {
      void loadCart();
    });
    return unsubscribe;
  }, [loadCart]);

  const updateItemQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      const updated = await cartService.updateItem({
        itemId,
        quantity,
        isAuthenticated,
      });
      setCart(updated);
    },
    [isAuthenticated],
  );

  const removeItem = useCallback(
    async (itemId: string) => {
      const updated = await cartService.removeItem({ itemId, isAuthenticated });
      setCart(updated);
    },
    [isAuthenticated],
  );

  const items = cart?.items ?? [];
  const cartCount = useMemo(
    () => items.reduce((total, item) => total + item.quantity, 0),
    [items],
  );
  const subtotal = useMemo(
    () =>
      items.reduce(
        (total: number, item: CartItem) => total + parsePrice(item.priceSnapshot) * item.quantity,
        0,
      ),
    [items],
  );

  return {
    cart,
    items,
    cartCount,
    subtotal,
    loading,
    error,
    refresh: loadCart,
    removeItem,
    updateItemQuantity,
  };
};
