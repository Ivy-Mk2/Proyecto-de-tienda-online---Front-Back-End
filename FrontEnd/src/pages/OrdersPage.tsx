import { useEffect, useState } from 'react';
import { ordersService } from '../services/orders.service';
import { Order } from '../types/api';
import { getApiErrorMessage } from '../hooks/useApiError';

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setError('');
      setOrders(await ordersService.list());
    } catch (err) {
      setError(getApiErrorMessage(err));
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onCheckout = async () => {
    await ordersService.checkout();
    await load();
  };

  return (
    <main className="container">
      <h1>Órdenes</h1>
      <button onClick={() => void onCheckout()}>Checkout</button>
      {error ? <p className="error">{error}</p> : null}
      <div className="stack">
        {orders.map((order) => (
          <article key={order.id} className="card">
            <p>Orden: {order.id}</p>
            <p>Total: ${order.total}</p>
            <p>Estado: {order.paymentStatus}</p>
          </article>
        ))}
      </div>
    </main>
  );
};
