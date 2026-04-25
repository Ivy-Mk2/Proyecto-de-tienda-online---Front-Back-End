import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ordersService } from '../services/orders.service';
import { productsService } from '../services/products.service';
import { resolveImageUrl } from '../lib/api/imageUrl';
import { getApiErrorMessage } from '../hooks/useApiError';
import '../styles/808xhz-pages.css';
import type { AdminOrder } from '../services/orders.service';
import type { Product } from '../types/api';

const fmtPEN = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

const STATUS_MAP: Record<string, { label: string; tone: string }> = {
  PENDING: { label: 'Pendiente', tone: 'pending' },
  PROCESSING: { label: 'Procesando', tone: 'pending' },
  PAID: { label: 'Pagado', tone: 'ok' },
  SHIPPED: { label: 'En camino', tone: 'warn' },
  DELIVERED: { label: 'Entregado', tone: 'ok' },
  CANCELLED: { label: 'Cancelado', tone: 'off' },
  REFUNDED: { label: 'Reembolso', tone: 'off' },
};

const BAR_HEIGHTS = [38, 62, 45, 78, 56, 90, 70, 52, 84, 68, 95, 60, 44, 82];

type NavItem = { label: string; icon: string; current?: boolean; badge?: string };
type NavSection = { group: string; items: NavItem[] };

const NAV_ITEMS: NavSection[] = [
  { group: 'General', items: [
    { label: 'Dashboard', icon: 'fa-solid fa-gauge', current: true },
    { label: 'Productos', icon: 'fa-solid fa-box' },
    { label: 'Colecciones', icon: 'fa-solid fa-layer-group' },
    { label: 'Categorías', icon: 'fa-solid fa-tags' },
  ]},
  { group: 'Ventas', items: [
    { label: 'Pedidos', icon: 'fa-solid fa-receipt' },
    { label: 'Devoluciones', icon: 'fa-solid fa-rotate-left' },
    { label: 'Cupones', icon: 'fa-solid fa-ticket' },
  ]},
  { group: 'Personas', items: [
    { label: 'Clientes', icon: 'fa-solid fa-users' },
    { label: 'Reseñas', icon: 'fa-solid fa-comment' },
  ]},
  { group: 'Sistema', items: [
    { label: 'Analíticas', icon: 'fa-solid fa-chart-line' },
    { label: 'Configuración', icon: 'fa-solid fa-gear' },
  ]},
];

export const AdminPage = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      ordersService.adminList({ page: 1, limit: 10 }).catch(() => ({ data: [], meta: { page: 1, total: 0, limit: 10 } })),
      productsService.list(),
    ])
      .then(([ordersResp, prods]) => {
        setOrders(ordersResp.data);
        setProducts(prods);
        setError('');
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = orders.reduce((s, o) => s + parseFloat(o.total), 0);
  const avgTicket = orders.length > 0 ? totalRevenue / orders.length : 0;
  const today = new Date().toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <div className="h808-page">
      <div className="admin-shell">
        <aside className="admin__side">
          <div className="admin__brand">
            <span className="h808-mark" style={{ fontSize: 20 }}>808<em>xHz</em></span>
            <span className="role">Admin</span>
          </div>
          <nav className="admin__nav">
            {NAV_ITEMS.map((section) => (
              <Fragment key={section.group}>
                <div className="group">{section.group}</div>
                {section.items.map((item) => (
                  <a key={item.label} aria-current={item.current ? 'true' : undefined} style={{ cursor: 'pointer' }}>
                    <span><i className={item.icon}></i>{item.label}</span>
                    {item.badge && <span className="badge">{item.badge}</span>}
                  </a>
                ))}
              </Fragment>
            ))}
          </nav>
        </aside>

        <main className="admin__main">
          <div className="admin__topbar">
            <div className="admin__search">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input placeholder="Buscar productos, pedidos, clientes…" />
            </div>
            <div className="admin__top-acts">
              <button className="admin__icon-btn"><i className="fa-regular fa-bell"></i></button>
              <button className="admin__icon-btn"><i className="fa-regular fa-envelope"></i></button>
              <Link to="/" className="admin__btn admin__btn--ghost" style={{ textDecoration: 'none' }}>
                <i className="fa-solid fa-eye"></i>Ver tienda
              </Link>
              <Link to="/productos" className="admin__btn" style={{ textDecoration: 'none' }}>
                <i className="fa-solid fa-plus"></i>Nuevo producto
              </Link>
            </div>
          </div>

          <h1 className="admin__h1">Dashboard</h1>
          <p className="admin__h1-sub">Resumen de actividad — {today}</p>

          {loading && <p style={{ color: 'var(--fg-2)' }}>Cargando datos…</p>}
          {error && <p style={{ color: 'var(--red)' }}>{error}</p>}

          <div className="admin__kpis">
            <div className="admin__kpi">
              <div className="l">Ventas (total)</div>
              <div className="n">{fmtPEN(totalRevenue)}</div>
              <div className="delta up">▲ Últimos pedidos</div>
              <div className="spark">{BAR_HEIGHTS.slice(0, 10).map((h, i) => <span key={i} style={{ height: `${h * 0.28}px` }} />)}</div>
            </div>
            <div className="admin__kpi">
              <div className="l">Pedidos</div>
              <div className="n">{orders.length}</div>
              <div className="delta up">▲ Total registrados</div>
              <div className="spark">{BAR_HEIGHTS.slice(2, 12).map((h, i) => <span key={i} style={{ height: `${h * 0.28}px` }} />)}</div>
            </div>
            <div className="admin__kpi">
              <div className="l">Ticket promedio</div>
              <div className="n">{fmtPEN(avgTicket)}</div>
              <div className="delta up">▲ Por orden</div>
              <div className="spark">{BAR_HEIGHTS.slice(1, 11).map((h, i) => <span key={i} style={{ height: `${h * 0.28}px` }} />)}</div>
            </div>
            <div className="admin__kpi">
              <div className="l">Productos activos</div>
              <div className="n">{products.filter((p) => p.isActive).length}</div>
              <div className="delta up">▲ En catálogo</div>
              <div className="spark">{BAR_HEIGHTS.slice(3, 13).map((h, i) => <span key={i} style={{ height: `${h * 0.28}px` }} />)}</div>
            </div>
          </div>

          <div className="admin__split">
            <div className="admin__panel">
              <div className="admin__panel-hdr">
                <h3>Ventas · Historial</h3>
                <div className="filters">
                  <button>7D</button>
                  <button aria-pressed="true">14D</button>
                  <button>30D</button>
                  <button>90D</button>
                </div>
              </div>
              <div className="admin__chart">
                {BAR_HEIGHTS.map((h, i) => <div key={i} className="bar" style={{ height: `${h}%` }} />)}
              </div>
              <div className="admin__chart-axis">
                <span>10 Abr</span><span>13 Abr</span><span>16 Abr</span><span>19 Abr</span><span>23 Abr</span>
              </div>
            </div>

            <div className="admin__panel">
              <div className="admin__panel-hdr">
                <h3>Top productos</h3>
                <a style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--fg-2)', textTransform: 'uppercase', cursor: 'pointer' }}>Ver todo</a>
              </div>
              <div className="admin__top-products">
                {products.slice(0, 5).map((p, i) => {
                  const imgs = p.images?.slice().sort((a, b) => a.order - b.order) ?? [];
                  const img = imgs[0]?.imageUrl ? resolveImageUrl(imgs[0].imageUrl) : 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=200&q=80';
                  return (
                    <div className="admin__tp-row" key={p.id}>
                      <img src={img} alt="" />
                      <div className="info"><b>{p.name}</b><span>{p.category} · {p.stock} en stock</span></div>
                      <div className="n">{String(i * 2 + 12).padStart(2, '0')}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="admin__panel">
            <div className="admin__panel-hdr">
              <h3>Pedidos recientes</h3>
              <a style={{ fontSize: 11, letterSpacing: '0.14em', color: 'var(--fg-2)', textTransform: 'uppercase', cursor: 'pointer' }}>Ver todos →</a>
            </div>
            <table className="admin__table">
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Fecha</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((o) => {
                  const statusInfo = STATUS_MAP[o.paymentStatus] ?? { label: o.paymentStatus, tone: 'pending' };
                  const date = new Date(o.createdAt);
                  return (
                    <tr key={o.id}>
                      <td>
                        <b style={{ color: '#fff', fontWeight: 600 }}>#{o.id.slice(0, 8).toUpperCase()}</b>
                        <div className="sku">{o.items.length} producto(s)</div>
                      </td>
                      <td>{o.user?.name ?? '—'}</td>
                      <td style={{ color: '#fff', fontWeight: 700 }}>{fmtPEN(parseFloat(o.total))}</td>
                      <td><span className={`admin__status admin__status--${statusInfo.tone}`}>{statusInfo.label}</span></td>
                      <td style={{ color: 'var(--fg-3)' }}>{date.toLocaleDateString('es-PE')}</td>
                      <td><button className="admin__icon-btn" style={{ width: 32, height: 32, fontSize: 11 }}><i className="fa-solid fa-ellipsis"></i></button></td>
                    </tr>
                  );
                })}
                {orders.length === 0 && !loading && (
                  <tr><td colSpan={6} style={{ color: 'var(--fg-2)', padding: '32px 12px' }}>No hay pedidos registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};
