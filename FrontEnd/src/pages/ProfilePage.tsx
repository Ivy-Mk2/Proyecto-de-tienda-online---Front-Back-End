import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersService } from '../services/orders.service';
import { favoritesService } from '../services/favorites.service';
import { Shell808 } from '../components/Shell808/Shell808';
import type { Order } from '../types/api';

const fmtPEN = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

const NAV_LINKS = [
  { label: 'Mi cuenta', icon: 'fa-regular fa-user', to: '/perfil' },
  { label: 'Mis pedidos', icon: 'fa-solid fa-box', to: '/orders' },
  { label: 'Favoritos', icon: 'fa-regular fa-heart', to: '/favoritos' },
  { label: 'Direcciones', icon: 'fa-solid fa-location-dot', to: '#' },
  { label: 'Pagos', icon: 'fa-solid fa-credit-card', to: '#' },
  { label: 'Notificaciones', icon: 'fa-solid fa-bell', to: '#' },
];

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [favCount, setFavCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      ordersService.list().catch(() => []),
      favoritesService.list().catch(() => []),
    ]).then(([ords, favs]) => {
      setOrders(ords);
      setFavCount(favs.length);
    }).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const totalSpent = orders.reduce((s, o) => s + parseFloat(o.total), 0);
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : 'U';
  const joinDate = user?.createdAt ? new Date(user.createdAt) : null;
  const joinDateStr = joinDate
    ? `${joinDate.getDate()} · ${joinDate.toLocaleString('es-PE', { month: 'long' })} · ${joinDate.getFullYear()}`
    : '—';

  return (
    <Shell808>
      <div className="profile-page">
        <div className="profile__side">
          <div className="profile__card">
            <div className="profile__avatar">{initials}</div>
            <h3 className="profile__name">{user?.name ?? 'Usuario'}</h3>
            <div className="profile__email">{user?.email}</div>
            <span className="profile__tier">
              <i className="fa-solid fa-star"></i>
              {user?.role === 'ADMIN' ? ' ADMIN 808' : ' MIEMBRO 808'}
            </span>
          </div>

          <nav className="profile__nav">
            {NAV_LINKS.map((l) => (
              <Link key={l.label} to={l.to} aria-current={l.to === '/perfil' ? 'true' : undefined}>
                <span><i className={l.icon} style={{ marginRight: 10 }}></i>{l.label}</span>
                <i className="fa-solid fa-chevron-right"></i>
              </Link>
            ))}
            <a style={{ cursor: 'pointer' }} onClick={() => void handleLogout()}>
              <span><i className="fa-solid fa-right-from-bracket" style={{ marginRight: 10 }}></i>Cerrar sesión</span>
              <i className="fa-solid fa-chevron-right"></i>
            </a>
          </nav>
        </div>

        <div className="profile__main">
          <div className="profile__hdr">
            <h1>Hola, {user?.name?.split(' ')[0] ?? 'tú'}.</h1>
            <p>Gestiona tu cuenta, pedidos y preferencias de envío.</p>
          </div>

          {!loading && (
            <div className="profile__stats">
              <div className="profile__stat">
                <div className="l">Pedidos totales</div>
                <div className="n">{orders.length}</div>
                <div className="sub">{orders.filter((o) => o.paymentStatus === 'DELIVERED').length} entregados</div>
              </div>
              <div className="profile__stat">
                <div className="l">Total gastado</div>
                <div className="n">{fmtPEN(totalSpent)}</div>
                <div className="sub"><b>Histórico</b></div>
              </div>
              <div className="profile__stat">
                <div className="l">Puntos 808</div>
                <div className="n">{Math.floor(totalSpent / 10)}</div>
                <div className="sub">Canjeables en tu próxima compra</div>
              </div>
              <div className="profile__stat">
                <div className="l">Favoritos</div>
                <div className="n">{String(favCount).padStart(2, '0')}</div>
                <div className="sub">Piezas guardadas</div>
              </div>
            </div>
          )}

          <div className="profile__section">
            <h2>Información personal</h2>
            <div className="profile__row">
              <div className="k">Nombre</div>
              <div className="v">{user?.name ?? '—'}</div>
              <a className="edit">Editar</a>
            </div>
            <div className="profile__row">
              <div className="k">Correo</div>
              <div className="v">{user?.email ?? '—'}</div>
              <a className="edit">Editar</a>
            </div>
            <div className="profile__row">
              <div className="k">Proveedor</div>
              <div className="v">{user?.authProvider === 'GOOGLE' ? 'Google OAuth' : 'Email / Contraseña'}</div>
              <a className="edit">—</a>
            </div>
            <div className="profile__row">
              <div className="k">Rol</div>
              <div className="v">{user?.role === 'ADMIN' ? 'Administrador' : 'Cliente'}</div>
              <a className="edit">—</a>
            </div>
            <div className="profile__row">
              <div className="k">Miembro desde</div>
              <div className="v">{joinDateStr}</div>
              <a className="edit">—</a>
            </div>
            {user?.authProvider !== 'GOOGLE' && (
              <div className="profile__row">
                <div className="k">Contraseña</div>
                <div className="v">••••••••••</div>
                <a className="edit">Cambiar</a>
              </div>
            )}
          </div>

          {user?.role === 'ADMIN' && (
            <div className="profile__section">
              <h2>Panel de administración</h2>
              <div className="profile__row">
                <div className="k">Acceso admin</div>
                <div className="v">Tienes acceso al panel de administración</div>
                <Link to="/admin" className="edit">Ir al panel →</Link>
              </div>
            </div>
          )}

          <div className="profile__section">
            <h2>Zona de peligro</h2>
            <div className="profile__row">
              <div className="k">Sesión</div>
              <div className="v">Cerrar sesión en todos los dispositivos</div>
              <a className="edit" style={{ color: 'var(--red)' }} onClick={() => void handleLogout()}>Cerrar sesión</a>
            </div>
          </div>
        </div>
      </div>
    </Shell808>
  );
};
