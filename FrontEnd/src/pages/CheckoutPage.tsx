import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartService } from '../services/cart.service';
import { ordersService } from '../services/orders.service';
import { Cart, Order, ShippingAddress } from '../types/api';
import { getApiErrorMessage } from '../hooks/useApiError';
import { resolveImageUrl } from '../lib/api/imageUrl';
import './CheckoutPage.css';

type Step = 'delivery' | 'payment' | 'review' | 'success';

type DeliveryInfo = {
  fullName: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  notes: string;
};

const PAYMENT_METHODS = [
  { id: 'mercadopago', label: 'Mercado Pago', icon: 'fa-credit-card', note: 'Próximamente' },
  { id: 'transfer', label: 'Transferencia bancaria', icon: 'fa-building-columns', note: '' },
  { id: 'cash', label: 'Contra entrega', icon: 'fa-money-bill-wave', note: '' },
];

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(price));

const STEPS: Step[] = ['delivery', 'payment', 'review', 'success'];
const STEP_LABELS: Record<Step, string> = {
  delivery: 'Envío',
  payment: 'Pago',
  review: 'Confirmación',
  success: 'Listo',
};

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [cartLoading, setCartLoading] = useState(true);
  const [cartError, setCartError] = useState('');
  const [step, setStep] = useState<Step>('delivery');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);

  const [delivery, setDelivery] = useState<DeliveryInfo>({
    fullName: '',
    phone: '',
    address: '',
    district: '',
    city: 'Lima',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('cash');

  useEffect(() => {
    const load = async () => {
      try {
        setCartError('');
        const data = await cartService.getCart(true);
        setCart(data);
        if (!data.items.length) navigate('/cart', { replace: true });
      } catch (err) {
        setCartError(getApiErrorMessage(err));
      } finally {
        setCartLoading(false);
      }
    };

    void load();
  }, [navigate]);

  const subtotal = cart?.items.reduce(
    (acc, item) => acc + Number(item.priceSnapshot) * item.quantity,
    0,
  ) ?? 0;

  const shippingCost = paymentMethod === 'cash' ? 0 : 10;
  const total = subtotal + shippingCost;

  const onDeliverySubmit = (e: FormEvent) => {
    e.preventDefault();
    setStep('payment');
  };

  const onPlaceOrder = async () => {
    try {
      setPlacingOrder(true);
      setOrderError('');
      const shippingAddress: ShippingAddress = {
        fullName: delivery.fullName,
        phone: delivery.phone,
        address: delivery.address,
        district: delivery.district,
        city: delivery.city,
        notes: delivery.notes || undefined,
      };
      const order = await ordersService.checkout(shippingAddress);
      setCompletedOrder(order);
      setStep('success');
    } catch (err) {
      setOrderError(getApiErrorMessage(err));
    } finally {
      setPlacingOrder(false);
    }
  };

  const stepIndex = STEPS.indexOf(step);

  if (cartLoading) {
    return (
      <main className="container checkout-page">
        <p>Cargando carrito...</p>
      </main>
    );
  }

  if (cartError) {
    return (
      <main className="container checkout-page">
        <p className="error">{cartError}</p>
        <Link to="/cart">Volver al carrito</Link>
      </main>
    );
  }

  return (
    <main className="container checkout-page">
      <h1 className="checkout-title">Checkout</h1>

      {step !== 'success' ? (
        <nav className="checkout-steps">
          {STEPS.filter((s) => s !== 'success').map((s, idx) => (
            <div
              key={s}
              className={`checkout-steps__item ${idx <= stepIndex ? 'checkout-steps__item--done' : ''} ${s === step ? 'checkout-steps__item--active' : ''}`}
            >
              <span className="checkout-steps__dot">{idx + 1}</span>
              <span className="checkout-steps__label">{STEP_LABELS[s]}</span>
            </div>
          ))}
        </nav>
      ) : null}

      <div className="checkout-layout">
        {/* Left: step content */}
        <div className="checkout-main">
          {step === 'delivery' ? (
            <section className="card checkout-card">
              <h2>Datos de envío</h2>
              <form onSubmit={onDeliverySubmit} className="checkout-form">
                <label>
                  Nombre completo *
                  <input
                    required
                    value={delivery.fullName}
                    onChange={(e) => setDelivery((d) => ({ ...d, fullName: e.target.value }))}
                    placeholder="María García López"
                  />
                </label>
                <label>
                  Teléfono *
                  <input
                    required
                    type="tel"
                    value={delivery.phone}
                    onChange={(e) => setDelivery((d) => ({ ...d, phone: e.target.value }))}
                    placeholder="+51 999 999 999"
                  />
                </label>
                <label>
                  Dirección *
                  <input
                    required
                    value={delivery.address}
                    onChange={(e) => setDelivery((d) => ({ ...d, address: e.target.value }))}
                    placeholder="Av. Principal 123, Dpto. 4"
                  />
                </label>
                <div className="checkout-form__row">
                  <label>
                    Distrito *
                    <input
                      required
                      value={delivery.district}
                      onChange={(e) => setDelivery((d) => ({ ...d, district: e.target.value }))}
                      placeholder="Miraflores"
                    />
                  </label>
                  <label>
                    Ciudad *
                    <input
                      required
                      value={delivery.city}
                      onChange={(e) => setDelivery((d) => ({ ...d, city: e.target.value }))}
                    />
                  </label>
                </div>
                <label>
                  Referencia / Instrucciones
                  <textarea
                    rows={2}
                    value={delivery.notes}
                    onChange={(e) => setDelivery((d) => ({ ...d, notes: e.target.value }))}
                    placeholder="Timbre no funciona, llamar al llegar..."
                  />
                </label>
                <button type="submit" className="checkout-btn">
                  Continuar al pago →
                </button>
              </form>
            </section>
          ) : null}

          {step === 'payment' ? (
            <section className="card checkout-card">
              <h2>Método de pago</h2>
              <div className="payment-options">
                {PAYMENT_METHODS.map((method) => (
                  <label
                    key={method.id}
                    className={`payment-option ${paymentMethod === method.id ? 'payment-option--active' : ''} ${method.note ? 'payment-option--disabled' : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => { if (!method.note) setPaymentMethod(method.id); }}
                      disabled={Boolean(method.note)}
                    />
                    <i className={`fa-solid ${method.icon} payment-option__icon`} />
                    <span className="payment-option__label">{method.label}</span>
                    {method.note ? <span className="payment-option__badge">{method.note}</span> : null}
                  </label>
                ))}
              </div>
              <div className="checkout-nav">
                <button className="checkout-btn checkout-btn--secondary" onClick={() => setStep('delivery')}>
                  ← Volver
                </button>
                <button className="checkout-btn" onClick={() => setStep('review')}>
                  Revisar pedido →
                </button>
              </div>
            </section>
          ) : null}

          {step === 'review' ? (
            <section className="card checkout-card">
              <h2>Resumen del pedido</h2>

              <div className="review-section">
                <h3>Envío a</h3>
                <p>{delivery.fullName}</p>
                <p>{delivery.address}, {delivery.district}</p>
                <p>{delivery.city} · {delivery.phone}</p>
                {delivery.notes ? <p className="review-notes">{delivery.notes}</p> : null}
              </div>

              <div className="review-section">
                <h3>Método de pago</h3>
                <p>{PAYMENT_METHODS.find((m) => m.id === paymentMethod)?.label}</p>
              </div>

              <div className="review-section">
                <h3>Productos</h3>
                <div className="review-items">
                  {cart?.items.map((item) => {
                    const img = resolveImageUrl(item.product.images[0]?.imageUrl);
                    return (
                      <div key={item.id} className="review-item">
                        {img ? (
                          <img src={img} alt={item.product.name} className="review-item__img" />
                        ) : (
                          <div className="review-item__img review-item__img--placeholder" />
                        )}
                        <div className="review-item__info">
                          <p className="review-item__name">{item.product.name}</p>
                          <p className="review-item__qty">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="review-item__price">
                          {formatPrice(Number(item.priceSnapshot) * item.quantity)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {orderError ? <p className="error">{orderError}</p> : null}

              <div className="checkout-nav">
                <button className="checkout-btn checkout-btn--secondary" onClick={() => setStep('payment')}>
                  ← Volver
                </button>
                <button
                  className="checkout-btn checkout-btn--confirm"
                  onClick={() => void onPlaceOrder()}
                  disabled={placingOrder}
                >
                  {placingOrder ? 'Procesando...' : 'Confirmar pedido'}
                </button>
              </div>
            </section>
          ) : null}

          {step === 'success' && completedOrder ? (
            <section className="card checkout-card checkout-success">
              <i className="fa-solid fa-circle-check checkout-success__icon" />
              <h2>¡Pedido confirmado!</h2>
              <p>Tu orden <strong>#{completedOrder.id.slice(0, 8).toUpperCase()}</strong> fue creada exitosamente.</p>
              <p>Total: <strong>{formatPrice(completedOrder.total)}</strong></p>
              <div className="checkout-success__actions">
                <Link to="/orders" className="checkout-btn">
                  Ver mis pedidos
                </Link>
                <Link to="/productos" className="checkout-btn checkout-btn--secondary">
                  Seguir comprando
                </Link>
              </div>
            </section>
          ) : null}
        </div>

        {/* Right: order summary */}
        {step !== 'success' ? (
          <aside className="checkout-summary card">
            <h2>Resumen</h2>
            <div className="checkout-summary__items">
              {cart?.items.map((item) => (
                <div key={item.id} className="checkout-summary__item">
                  <span className="checkout-summary__item-name">
                    {item.product.name}
                    <span className="checkout-summary__item-qty"> ×{item.quantity}</span>
                  </span>
                  <span>{formatPrice(Number(item.priceSnapshot) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="checkout-summary__totals">
              <div className="checkout-summary__row">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="checkout-summary__row">
                <span>Envío</span>
                <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
              </div>
              <div className="checkout-summary__row checkout-summary__row--total">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  );
};
