import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../../styles/808xhz.css';
import '../../styles/808xhz-pages.css';
import { useAuth } from '../../context/AuthContext';
import { useCartData } from '../../hooks/useCartData';

const SIDEBAR_LINKS = [
  { name: 'Inicio', to: '/' },
  { name: 'Todos los productos', to: '/productos' },
  { name: 'Favoritos', to: '/favoritos' },
  { name: 'Carrito', to: '/cart' },
  { name: 'Mis pedidos', to: '/orders' },
  { name: 'Mi perfil', to: '/perfil' },
];

export const BrandMark = ({ size = 28 }: { size?: number }) => (
  <span className="h808-mark" style={{ fontSize: size }}>808<em>xHz</em></span>
);

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <>
      <div className={`h808-scrim ${open ? 'open' : ''}`} onClick={onClose} />
      <aside className={`h808-sidebar ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="h808-sidebar__hdr">
          <BrandMark size={22} />
          <button className="h808-sidebar__close" onClick={onClose} aria-label="Cerrar menú">
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <nav className="h808-sidebar__nav">
          {SIDEBAR_LINKS.map((l) => (
            <Link key={l.name} to={l.to} className="h808-sidebar__link" onClick={onClose}>
              <span>{l.name}</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          ))}
        </nav>
        <div className="h808-sidebar__foot">
          <div>Envíos a todo Perú</div>
          <div className="h808-sidebar__socials">
            <a><i className="fa-brands fa-instagram"></i></a>
            <a><i className="fa-brands fa-tiktok"></i></a>
            <a><i className="fa-brands fa-x-twitter"></i></a>
            <a><i className="fa-brands fa-whatsapp"></i></a>
          </div>
        </div>
      </aside>
    </>
  );
}

const TICKER_ITEMS = [
  'ENVÍO GRATIS +S/ 200', 'DROP 04 DISPONIBLE', 'CAMBIOS EN 30 DÍAS',
  'ENTREGAS A TODO PERÚ', 'PAGO EN 3 CUOTAS SIN INTERÉS', 'EDICIÓN LIMITADA',
];

function Ticker() {
  const strip = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="h808-ticker">
      <div className="h808-ticker__track">
        {strip.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );
}

function Header808({
  cartCount,
  onBurger,
  isAuthenticated,
}: {
  cartCount: number;
  onBurger: () => void;
  isAuthenticated: boolean;
}) {
  return (
    <header className="h808-hdr">
      <div className="h808-hdr__left">
        <button className="h808-hdr__burger" onClick={onBurger}>
          <i className="fa-solid fa-bars"></i>
          <span>Menú</span>
        </button>
      </div>
      <Link to="/" className="h808-hdr__logo"><BrandMark size={26} /></Link>
      <div className="h808-hdr__right">
        <button className="h808-hdr__icon" aria-label="Buscar">
          <i className="fa-solid fa-magnifying-glass"></i>
        </button>
        <Link to={isAuthenticated ? '/orders' : '/register'} className="h808-hdr__icon" aria-label="Cuenta">
          <i className="fa-regular fa-user"></i>
        </Link>
        <Link to="/cart" className="h808-hdr__cart">
          <i className="fa-solid fa-bag-shopping"></i>
          <span>Carrito <span className="h808-hdr__cart__count">({cartCount})</span></span>
        </Link>
      </div>
    </header>
  );
}

function Footer808() {
  return (
    <footer className="h808-ft">
      <div className="h808-ft__top">
        <div className="h808-ft__brand">
          <BrandMark size={32} />
          <p className="h808-ft__tagline">
            Streetwear underground hecho en Perú. Ediciones limitadas, sin repetición.
          </p>
        </div>
        <div className="h808-ft__col">
          <h4>Tienda</h4>
          <ul>
            <li><Link to="/productos">Todos los productos</Link></li>
            <li><Link to="/favoritos">Favoritos</Link></li>
          </ul>
        </div>
        <div className="h808-ft__col">
          <h4>Cuenta</h4>
          <ul>
            <li><Link to="/orders">Mis pedidos</Link></li>
            <li><Link to="/register">Registrarse</Link></li>
          </ul>
        </div>
        <div className="h808-ft__col">
          <h4>Empresa</h4>
          <ul>
            <li><a>Términos</a></li>
            <li><a>Privacidad</a></li>
          </ul>
        </div>
        <div className="h808-ft__news">
          <h4>Newsletter</h4>
          <p>Accede a drops antes que nadie.</p>
          <form className="h808-ft__news-form" onSubmit={(e) => e.preventDefault()}>
            <input placeholder="tu@email.com" />
            <button type="submit">OK</button>
          </form>
        </div>
      </div>
      <div className="h808-ft__bottom">
        <span>© {new Date().getFullYear()} 808xHz · Todos los derechos reservados.</span>
        <div className="h808-ft__socials">
          <a><i className="fa-brands fa-instagram"></i></a>
          <a><i className="fa-brands fa-tiktok"></i></a>
          <a><i className="fa-brands fa-x-twitter"></i></a>
        </div>
        <span className="h808-ft__loc"><i className="fa-solid fa-location-dot"></i> Lima · Perú</span>
      </div>
    </footer>
  );
}

export function Shell808({ children }: { children: React.ReactNode }) {
  const [sbOpen, setSbOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const { cartCount } = useCartData();
  const { pathname } = useLocation();

  useEffect(() => {
    document.body.classList.add('h808xhz-body');
    return () => { document.body.classList.remove('h808xhz-body'); };
  }, []);

  useEffect(() => { setSbOpen(false); }, [pathname]);

  return (
    <div className="h808">
      <Sidebar open={sbOpen} onClose={() => setSbOpen(false)} />
      <Header808 cartCount={cartCount} onBurger={() => setSbOpen(true)} isAuthenticated={isAuthenticated} />
      <Ticker />
      {children}
      <Footer808 />
    </div>
  );
}
