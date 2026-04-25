import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/cart.service';
import { resolveImageUrl } from '../lib/api/imageUrl';
import { getApiErrorMessage } from '../hooks/useApiError';
import { Shell808 } from '../components/Shell808/Shell808';
import type { Cart } from '../types/api';

const fmtPEN = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80';

export const CartPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [promoCode, setPromoCode] = useState('');

  useEffect(() => {
    setLoading(true);
    cartService.getCart(isAuthenticated)
      .then((c) => { setCart(c); setError(''); })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const handleUpdate = async (itemId: string, qty: number) => {
    try {
      setBusyId(itemId);
      const updated = await cartService.updateItem({ itemId, quantity: qty, isAuthenticated });
      setCart(updated);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (itemId: string) => {
    try {
      setBusyId(itemId);
      const updated = await cartService.removeItem({ itemId, isAuthenticated });
      setCart(updated);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setBusyId(null);
    }
  };

  const items = cart?.items ?? [];
  const subtotal = items.reduce((sum, it) => sum + parseFloat(it.priceSnapshot) * it.quantity, 0);
  const itemCount = items.reduce((sum, it) => sum + it.quantity, 0);
  const shipping = subtotal >= 200 ? 0 : 15;
  const total = subtotal + shipping;

  return (
    <Shell808>
      <div className="cart-page">
        <div>
          <div className="cart__hdr">
            <h1>Tu carrito <span style={{ color: 'var(--red)' }}>({itemCount})</span></h1>
            <p>Reservado por 15 minutos. Completa tu compra para asegurar el stock.</p>
          </div>

          {loading && <p style={{ color: 'var(--fg-2)', padding: '40px 0' }}>Cargando carrito…</p>}
          {error && <p style={{ color: 'var(--red)', padding: '20px 0' }}>{error}</p>}

          {!loading && items.length === 0 && !error && (
            <div className="cart__empty">
              <i className="fa-solid fa-bag-shopping"></i>
              <h3>Tu carrito está vacío</h3>
              <p>Todavía no has agregado ningún producto.</p>
              <Link to="/productos" className="cart__empty a" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 24, background: 'var(--red)', color: '#000', padding: '14px 28px', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, textDecoration: 'none' }}>
                <span>Explorar productos</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>
          )}

          {!loading && items.length > 0 && (
            <>
              <div className="cart__list">
                {items.map((item) => {
                  const imgs = item.product.images?.slice().sort((a, b) => a.order - b.order) ?? [];
                  const img = imgs[0]?.imageUrl ? resolveImageUrl(imgs[0].imageUrl) : FALLBACK_IMG;
                  const lineTotal = parseFloat(item.priceSnapshot) * item.quantity;
                  return (
                    <div className="cart__item" key={item.id}>
                      <div className="cart__item-img">
                        <img src={img} alt={item.product.name} />
                      </div>
                      <div className="cart__item-info">
                        <div className="cart__item-cat">{item.product.category}</div>
                        <h3>{item.product.name}</h3>
                        <div className="cart__item-opts">
                          <span>Precio <b>{fmtPEN(parseFloat(item.priceSnapshot))}</b></span>
                        </div>
                        <div className="cart__item-acts">
                          <a onClick={() => void handleRemove(item.id)}>
                            <i className="fa-regular fa-trash-can" style={{ marginRight: 6 }}></i>
                            {busyId === item.id ? 'Eliminando…' : 'Eliminar'}
                          </a>
                        </div>
                      </div>
                      <div className="cart__item-right">
                        <div className="cart__item-price">{fmtPEN(lineTotal)}</div>
                        <div className="cart__item-qty">
                          <button
                            onClick={() => void handleUpdate(item.id, item.quantity - 1)}
                            disabled={busyId === item.id || item.quantity <= 1}
                          >
                            <i className="fa-solid fa-minus"></i>
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() => void handleUpdate(item.id, item.quantity + 1)}
                            disabled={busyId === item.id}
                          >
                            <i className="fa-solid fa-plus"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="cart__cont">
                <Link to="/productos"><i className="fa-solid fa-arrow-left"></i>Seguir comprando</Link>
                <a onClick={() => {
                  if (window.confirm('¿Vaciar el carrito?')) {
                    Promise.all(items.map((it) => cartService.removeItem({ itemId: it.id, isAuthenticated })))
                      .then((results) => setCart(results[results.length - 1] ?? null))
                      .catch((err) => setError(getApiErrorMessage(err)));
                  }
                }}>Vaciar carrito</a>
              </div>
            </>
          )}
        </div>

        {items.length > 0 && (
          <aside className="summary">
            <h2>Resumen del pedido</h2>
            <div className="summary__row">
              <span className="k">Subtotal ({itemCount} ítems)</span>
              <span>{fmtPEN(subtotal)}</span>
            </div>
            <div className="summary__row">
              <span className="k">Envío</span>
              <span>{shipping === 0 ? 'Gratis' : fmtPEN(shipping)}</span>
            </div>
            <div className="summary__promo">
              <input
                placeholder="Código de descuento"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
              />
              <button>Aplicar</button>
            </div>
            <div className="summary__row summary__row--total">
              <span>Total</span>
              <span className="v">{fmtPEN(total)}</span>
            </div>
            <button
              className="summary__checkout"
              onClick={() => navigate(isAuthenticated ? '/checkout' : '/register', { state: { from: { pathname: '/checkout' } } })}
            >
              <span>Ir a pagar</span>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
            <div className="summary__trust">
              <div><i className="fa-solid fa-lock"></i><span>Pago seguro · cifrado SSL</span></div>
              <div><i className="fa-solid fa-truck"></i><span>Envío gratis en Lima por compras +S/ 200</span></div>
              <div><i className="fa-solid fa-rotate-left"></i><span>Cambios fáciles en 30 días</span></div>
            </div>
          </aside>
        )}
      </div>
    </Shell808>
  );
};
