import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/cart.service';
import { Cart } from '../types/api';
import { getApiErrorMessage } from '../hooks/useApiError';

export const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setError('');
        setCart(await cartService.getCart(isAuthenticated));
      } catch (err) {
        setError(getApiErrorMessage(err));
      }
    };

    void load();
  }, [isAuthenticated]);

  const onUpdate = async (itemId: string, quantity: number) => {
    const updated = await cartService.updateItem({
      itemId,
      quantity,
      isAuthenticated,
    });
    setCart(updated);
  };

  const onRemove = async (itemId: string) => {
    const updated = await cartService.removeItem({ itemId, isAuthenticated });
    setCart(updated);
  };

  return (
    <main className="container">
      <h1>Carrito</h1>
      {error ? <p className="error">{error}</p> : null}
      <div className="stack">
        {cart?.items.map((item) => (
          <article className="card" key={item.id}>
            <h3>{item.product.name}</h3>
            <p>Cantidad: {item.quantity}</p>
            <div className="row">
              <button onClick={() => void onUpdate(item.id, item.quantity + 1)}>+1</button>
              <button
                disabled={item.quantity <= 1}
                onClick={() => void onUpdate(item.id, item.quantity - 1)}
              >
                -1
              </button>
              <button onClick={() => void onRemove(item.id)}>Eliminar</button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
};
