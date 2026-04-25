import { Fragment, useEffect, useState } from 'react';
import { ordersService } from '../services/orders.service';
import { getApiErrorMessage } from '../hooks/useApiError';
import { resolveImageUrl } from '../lib/api/imageUrl';
import { Shell808 } from '../components/Shell808/Shell808';
import type { Order } from '../types/api';

const fmtPEN = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80';

const STATUS_MAP: Record<string, { label: string; tone: string }> = {
  PENDING: { label: 'Pendiente', tone: 'pending' },
  PROCESSING: { label: 'Procesando', tone: 'pending' },
  PAID: { label: 'Pagado', tone: 'ok' },
  SHIPPED: { label: 'En camino', tone: 'warn' },
  DELIVERED: { label: 'Entregado', tone: 'ok' },
  CANCELLED: { label: 'Cancelado', tone: 'off' },
  REFUNDED: { label: 'Reembolsado', tone: 'off' },
};

const TRACK_LABELS = ['Confirmado', 'Preparado', 'Enviado', 'En reparto', 'Entregado'];

function getTrackSteps(status: string): Array<'done' | 'active' | ''> {
  const steps: Array<'done' | 'active' | ''> = ['', '', '', '', ''];
  const statusMap: Record<string, number> = {
    PENDING: 0, PROCESSING: 1, PAID: 1, SHIPPED: 2, DELIVERED: 4,
  };
  const activeIdx = statusMap[status] ?? 0;
  for (let i = 0; i < 5; i++) {
    if (i < activeIdx) steps[i] = 'done';
    else if (i === activeIdx) steps[i] = 'active';
  }
  return steps;
}

type Tab = 'all' | 'active' | 'delivered' | 'returns';

export const OrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('all');

  useEffect(() => {
    setLoading(true);
    ordersService.list()
      .then((data) => { setOrders(data); setError(''); })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter((o) => {
    if (tab === 'active') return ['PENDING', 'PROCESSING', 'PAID', 'SHIPPED'].includes(o.paymentStatus);
    if (tab === 'delivered') return o.paymentStatus === 'DELIVERED';
    if (tab === 'returns') return ['CANCELLED', 'REFUNDED'].includes(o.paymentStatus);
    return true;
  });

  const count = (t: Tab) => {
    if (t === 'all') return orders.length;
    if (t === 'active') return orders.filter((o) => ['PENDING', 'PROCESSING', 'PAID', 'SHIPPED'].includes(o.paymentStatus)).length;
    if (t === 'delivered') return orders.filter((o) => o.paymentStatus === 'DELIVERED').length;
    return orders.filter((o) => ['CANCELLED', 'REFUNDED'].includes(o.paymentStatus)).length;
  };

  return (
    <Shell808>
      <div className="ord">
        <div className="ord__hdr">
          <div>
            <h1>Mis pedidos</h1>
            <p>Rastrea, gestiona y vuelve a comprar piezas de ediciones pasadas.</p>
          </div>
        </div>

        <div className="ord__tabs">
          {(['all', 'active', 'delivered', 'returns'] as Tab[]).map((t) => {
            const labels: Record<Tab, string> = { all: 'Todos', active: 'En curso', delivered: 'Entregados', returns: 'Devoluciones' };
            return (
              <button key={t} className="ord__tab" aria-pressed={tab === t ? 'true' : 'false'} onClick={() => setTab(t)}>
                {labels[t]} <span className="count">({count(t)})</span>
              </button>
            );
          })}
        </div>

        {loading && <p style={{ color: 'var(--fg-2)', padding: '40px 0' }}>Cargando pedidos…</p>}
        {error && <p style={{ color: 'var(--red)', padding: '20px 0' }}>{error}</p>}

        {!loading && filtered.length === 0 && !error && (
          <div className="ord__empty" style={{ textAlign: 'center', padding: '80px 0', color: 'var(--fg-2)' }}>
            <p>No hay pedidos en esta categoría.</p>
          </div>
        )}

        <div className="ord__list">
          {filtered.map((order) => {
            const statusInfo = STATUS_MAP[order.paymentStatus] ?? { label: order.paymentStatus, tone: 'pending' };
            const steps = getTrackSteps(order.paymentStatus);
            const date = new Date(order.createdAt);
            const dateStr = `${date.getDate()} · ${date.toLocaleString('es-PE', { month: 'long' })} · ${date.getFullYear()}`;
            return (
              <div className="ord__card" key={order.id}>
                <div className="ord__card-hdr">
                  <div className="ord__card-meta">
                    <div className="k">Pedido</div>
                    <div className="v ord-id">#{order.id.slice(0, 8).toUpperCase()}</div>
                  </div>
                  <div className="ord__card-meta">
                    <div className="k">Fecha</div>
                    <div className="v">{dateStr}</div>
                  </div>
                  <div className="ord__card-meta">
                    <div className="k">Total</div>
                    <div className="v">{fmtPEN(parseFloat(order.total))}</div>
                  </div>
                  <div className="ord__card-meta">
                    <div className="k">Estado</div>
                    <div className="v">
                      <span className={`admin__status admin__status--${statusInfo.tone}`}>{statusInfo.label}</span>
                    </div>
                  </div>
                  <div className="ord__card-acts">
                    {order.paymentStatus === 'SHIPPED' && (
                      <button className="primary"><i className="fa-solid fa-location-dot"></i>Rastrear</button>
                    )}
                    <button><i className="fa-solid fa-rotate-right"></i>Volver a comprar</button>
                  </div>
                </div>

                <div className="ord__track">
                  <div className="ord__track-steps">
                    {steps.map((s, i) => (
                      <Fragment key={i}>
                        <div className={`ord__track-step${s === 'done' ? ' ord__track-step--done' : ''}${s === 'active' ? ' ord__track-step--active' : ''}`}>
                          <span className="dot"></span>
                          <span>{TRACK_LABELS[i]}</span>
                        </div>
                        {i < steps.length - 1 && <div className="ord__track-line"></div>}
                      </Fragment>
                    ))}
                  </div>
                  <div className="ord__track-eta">
                    <b>Estado:</b> {statusInfo.label}
                  </div>
                </div>

                <div className="ord__items">
                  {order.items.map((item) => (
                    <div className="ord__item" key={item.id}>
                      <img src={FALLBACK_IMG} alt="" />
                      <div className="ord__item-info">
                        <b>{item.productNameSnapshot}</b>
                        <span>Cant. {item.quantity}</span>
                        <em>{fmtPEN(parseFloat(item.subtotal))}</em>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Shell808>
  );
};
