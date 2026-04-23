import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersService } from '../services/orders.service';
import { Order } from '../types/api';
import { getApiErrorMessage } from '../hooks/useApiError';
import './OrdersPage.css';

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(price));

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  PENDING: { label: 'Pendiente', cls: 'order-status--pending' },
  PAID: { label: 'Pagado', cls: 'order-status--paid' },
  COMPLETED: { label: 'Completado', cls: 'order-status--completed' },
  CANCELLED: { label: 'Cancelado', cls: 'order-status--cancelled' },
};

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      setOrders(await ordersService.list());
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  return (
    <main className="container orders-page">
      <div className="orders-page__header">
        <h1>Mis pedidos</h1>
        <Link to="/checkout" className="orders-cta">
          Ir a checkout →
        </Link>
      </div>

      {error ? <p className="error">{error}</p> : null}

      {loading ? (
        <div className="stack">
          {[1, 2, 3].map((n) => <div key={n} className="orders-skeleton" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="orders-empty">
          <i className="fa-solid fa-bag-shopping orders-empty__icon" />
          <p>Todavía no tienes pedidos.</p>
          <Link to="/productos" className="orders-empty__cta">Explorar productos</Link>
        </div>
      ) : (
        <div className="stack">
          {orders.map((order) => {
            const status = STATUS_LABELS[order.paymentStatus] ?? { label: order.paymentStatus, cls: '' };
            return (
              <article key={order.id} className="order-card card">
                <div className="order-card__header">
                  <div>
                    <span className="order-card__id">
                      Pedido #{order.id.slice(0, 8).toUpperCase()}
                    </span>
                    <span className="order-card__date">
                      {new Date(order.createdAt).toLocaleDateString('es-PE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                  <span className={`order-status ${status.cls}`}>{status.label}</span>
                </div>

                <div className="order-card__items">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <span className="order-item__name">{item.productNameSnapshot}</span>
                      <span className="order-item__qty">×{item.quantity}</span>
                      <span className="order-item__price">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="order-card__footer">
                  <span>Total</span>
                  <strong className="order-card__total">{formatPrice(order.total)}</strong>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};
