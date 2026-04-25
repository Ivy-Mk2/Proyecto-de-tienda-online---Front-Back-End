import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { cartService } from '../services/cart.service';
import { ordersService } from '../services/orders.service';
import { resolveImageUrl } from '../lib/api/imageUrl';
import { getApiErrorMessage } from '../hooks/useApiError';
import { Shell808 } from '../components/Shell808/Shell808';
import type { Cart } from '../types/api';

const fmtPEN = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80';

type ShipMethod = { id: string; label: string; sub: string; icon: string; price: number };
type PayMethod = { id: string; label: string; sub: string; icon: string };

const SHIP_METHODS: ShipMethod[] = [
  { id: 'express', label: 'Olva · Express Lima', sub: 'Entrega mañana · gratis', icon: 'fa-solid fa-truck-fast', price: 0 },
  { id: 'pickup', label: 'Recojo en tienda · Miraflores', sub: 'Hoy después de 18:00 · gratis', icon: 'fa-solid fa-store', price: 0 },
  { id: 'provinces', label: 'Shalom · Provincias', sub: '48–72h · S/ 15', icon: 'fa-solid fa-box', price: 15 },
];

const PAY_METHODS: PayMethod[] = [
  { id: 'card', label: 'Tarjeta de crédito / débito', sub: 'Visa, Mastercard, Amex', icon: 'fa-regular fa-credit-card' },
  { id: 'yape', label: 'Yape', sub: 'Pago instantáneo con QR', icon: 'fa-solid fa-mobile-screen' },
  { id: 'plin', label: 'Plin', sub: 'Transferencia en segundos', icon: 'fa-solid fa-money-bill-wave' },
  { id: 'cash', label: 'Pago en efectivo · PagoEfectivo', sub: '24h para pagar en agentes o bancos', icon: 'fa-solid fa-building-columns' },
];

export const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [shipMethod, setShipMethod] = useState('express');
  const [payMethod, setPayMethod] = useState('card');

  const [form, setForm] = useState({
    firstName: user?.name?.split(' ')[0] ?? '',
    lastName: user?.name?.split(' ').slice(1).join(' ') ?? '',
    address: '',
    district: '',
    city: 'Lima',
    postalCode: '',
    phone: '',
    instructions: '',
  });

  useEffect(() => {
    cartService.getCart(true)
      .then((c) => { setCart(c); setError(''); })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const setField = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError('');
      const shippingAddress = {
        name: `${form.firstName} ${form.lastName}`.trim(),
        address: form.address,
        district: form.district,
        city: form.city,
        postalCode: form.postalCode,
        phone: form.phone,
        instructions: form.instructions,
        shipMethod,
        payMethod,
      };
      await ordersService.checkout(shippingAddress);
      navigate('/orders');
    } catch (err) {
      setError(getApiErrorMessage(err));
      setSubmitting(false);
    }
  };

  const items = cart?.items ?? [];
  const subtotal = items.reduce((s, it) => s + parseFloat(it.priceSnapshot) * it.quantity, 0);
  const shipPrice = SHIP_METHODS.find((m) => m.id === shipMethod)?.price ?? 0;
  const total = subtotal + shipPrice;

  return (
    <Shell808>
      <div className="co2">
        <div className="co2__hdr">
          <h1>Finalizar compra</h1>
          <p>Ya casi. Revisa tu envío y método de pago.</p>
        </div>

        <div className="co2__steps">
          <div className="co2__step co2__step--done">
            <span className="dot"><i className="fa-solid fa-check"></i></span>
            <span>Carrito</span>
          </div>
          <div className="co2__line"></div>
          <div className="co2__step co2__step--done">
            <span className="dot"><i className="fa-solid fa-check"></i></span>
            <span>Identificación</span>
          </div>
          <div className="co2__line"></div>
          <div className="co2__step co2__step--active">
            <span className="dot">3</span>
            <span>Envío y pago</span>
          </div>
          <div className="co2__line"></div>
          <div className="co2__step">
            <span className="dot">4</span>
            <span>Confirmación</span>
          </div>
        </div>

        {loading && <p style={{ color: 'var(--fg-2)', padding: '40px 0' }}>Cargando carrito…</p>}
        {error && <p style={{ color: 'var(--red)', padding: '12px 0' }}>{error}</p>}

        {!loading && items.length === 0 && (
          <div style={{ padding: '40px 0', color: 'var(--fg-2)' }}>
            <p>Tu carrito está vacío. <Link to="/productos" style={{ color: 'var(--red)' }}>Explorar productos →</Link></p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <form className="co2__body" onSubmit={(e) => void handleSubmit(e)}>
            <div>
              <div className="co2__card">
                <h2><span className="n">1</span> Dirección de envío</h2>
                <div className="co2__grid2">
                  <div className="co2__field"><label>Nombre</label><input value={form.firstName} onChange={setField('firstName')} required /></div>
                  <div className="co2__field"><label>Apellidos</label><input value={form.lastName} onChange={setField('lastName')} required /></div>
                  <div className="co2__field co2__field--full"><label>Dirección</label><input value={form.address} onChange={setField('address')} placeholder="Av. Arequipa 2450, Dpto 803" required /></div>
                  <div className="co2__field"><label>Distrito</label><input value={form.district} onChange={setField('district')} placeholder="Lince" required /></div>
                  <div className="co2__field"><label>Ciudad</label><input value={form.city} onChange={setField('city')} required /></div>
                  <div className="co2__field"><label>Código postal</label><input value={form.postalCode} onChange={setField('postalCode')} placeholder="15036" /></div>
                  <div className="co2__field"><label>Teléfono</label><input value={form.phone} onChange={setField('phone')} placeholder="+51 999 000 000" /></div>
                  <div className="co2__field co2__field--full"><label>Instrucciones para el courier (opcional)</label><input value={form.instructions} onChange={setField('instructions')} placeholder="Ej. Entregar en recepción" /></div>
                </div>
              </div>

              <div className="co2__card">
                <h2><span className="n">2</span> Método de envío</h2>
                <div className="co2__pay-opts">
                  {SHIP_METHODS.map((m) => (
                    <div key={m.id} className={`co2__pay-opt${shipMethod === m.id ? ' co2__pay-opt--active' : ''}`} onClick={() => setShipMethod(m.id)}>
                      <span className="ico"><i className={m.icon}></i></span>
                      <span className="label">{m.label}<small>{m.sub}</small></span>
                      <span className="radio"></span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="co2__card">
                <h2><span className="n">3</span> Método de pago</h2>
                <div className="co2__pay-opts">
                  {PAY_METHODS.map((m) => (
                    <div key={m.id} className={`co2__pay-opt${payMethod === m.id ? ' co2__pay-opt--active' : ''}`} onClick={() => setPayMethod(m.id)}>
                      <span className="ico"><i className={m.icon}></i></span>
                      <span className="label">{m.label}<small>{m.sub}</small></span>
                      <span className="radio"></span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="co2__footer">
                <Link to="/cart" className="co2__back"><i className="fa-solid fa-arrow-left"></i>Volver al carrito</Link>
                <button type="submit" className="co2__next" disabled={submitting}>
                  <span>{submitting ? 'Procesando…' : 'Confirmar pedido'}</span>
                  {!submitting && <i className="fa-solid fa-lock"></i>}
                </button>
              </div>
            </div>

            <aside className="summary">
              <h2>Tu pedido</h2>
              <div className="co2__items">
                {items.map((it) => {
                  const imgs = it.product.images?.slice().sort((a, b) => a.order - b.order) ?? [];
                  const img = imgs[0]?.imageUrl ? resolveImageUrl(imgs[0].imageUrl) : FALLBACK_IMG;
                  return (
                    <div className="co2__item" key={it.id}>
                      <img src={img} alt="" />
                      <div className="co2__item-info">
                        <b>{it.product.name}</b>
                        <span>{it.product.category}</span>
                        <span className="q">Cantidad: {it.quantity}</span>
                      </div>
                      <div className="co2__item-price">{fmtPEN(parseFloat(it.priceSnapshot) * it.quantity)}</div>
                    </div>
                  );
                })}
              </div>
              <div className="summary__row"><span className="k">Subtotal</span><span>{fmtPEN(subtotal)}</span></div>
              <div className="summary__row"><span className="k">Envío</span><span>{shipPrice === 0 ? 'Gratis' : fmtPEN(shipPrice)}</span></div>
              <div className="summary__row summary__row--total"><span>Total</span><span className="v">{fmtPEN(total)}</span></div>
              <div className="summary__trust" style={{ marginTop: 20 }}>
                <div><i className="fa-solid fa-lock"></i><span>Pago cifrado · certificado SSL</span></div>
                <div><i className="fa-solid fa-shield-halved"></i><span>Compra protegida por 808xHz</span></div>
              </div>
            </aside>
          </form>
        )}
      </div>
    </Shell808>
  );
};
