import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/808xhz.css';
import { useAuth } from '../context/AuthContext';
import { useBanners } from '../hooks/useBanners';
import { useBodySections } from '../hooks/useBodySections';
import { useCartData } from '../hooks/useCartData';
import { useFeaturedProducts } from '../hooks/useFeaturedProducts';
import { cartService } from '../services/cart.service';
import { favoritesService } from '../services/favorites.service';
import { getApiErrorMessage } from '../hooks/useApiError';
import { resolveImageUrl } from '../lib/api/imageUrl';
import type { Banner, BodySection, Product } from '../types/api';

const fmtPEN = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

const parsePrice = (value: string) => {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const SIDEBAR_STATIC_LINKS = [
  { name: 'Inicio', to: '/', icon: 'fa-solid fa-house' },
  { name: 'All Products', to: '/productos', icon: 'fa-solid fa-grid-horizontal' },
];

const CATEGORY_ICONS: Record<string, string> = {
  Polos: 'fa-solid fa-shirt',
  Poleras: 'fa-solid fa-vest',
  Pantalones: 'fa-solid fa-person',
  Zapatillas: 'fa-solid fa-shoe-prints',
};

const TICKER_ITEMS = [
  'ENVÍO GRATIS +S/ 200',
  'DROP 04 DISPONIBLE',
  'CAMBIOS EN 30 DÍAS',
  'ENTREGAS A TODO PERÚ',
  'PAGO EN 3 CUOTAS SIN INTERÉS',
  'EDICIÓN LIMITADA',
];

const HERO_FALLBACK_IMG =
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1800&q=85';
const SPLIT_BANNER_FALLBACKS = [
  'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&q=80',
];

const BrandMark = ({ size = 28 }: { size?: number }) => (
  <span className="h808-mark" style={{ fontSize: size }}>
    808<em>xHz</em>
  </span>
);

const Sidebar = ({
  open,
  onClose,
  categories,
}: {
  open: boolean;
  onClose: () => void;
  categories: string[];
}) => {
  const links = [
    ...SIDEBAR_STATIC_LINKS,
    ...categories.map((cat) => ({
      name: cat,
      to: `/productos?cat=${encodeURIComponent(cat)}`,
      icon: CATEGORY_ICONS[cat] ?? 'fa-solid fa-tag',
    })),
  ];
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
          {links.map((l) => (
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
};

const Header808 = ({
  cartCount,
  onBurger,
  isAuthenticated,
}: {
  cartCount: number;
  onBurger: () => void;
  isAuthenticated: boolean;
}) => (
  <header className="h808-hdr">
    <div className="h808-hdr__left">
      <button className="h808-hdr__burger" onClick={onBurger}>
        <i className="fa-solid fa-bars"></i>
        <span>Menú</span>
      </button>
    </div>
    <div className="h808-hdr__logo"><BrandMark size={26} /></div>
    <div className="h808-hdr__right">
      <button className="h808-hdr__icon" aria-label="Buscar">
        <i className="fa-solid fa-magnifying-glass"></i>
      </button>
      <Link
        to={isAuthenticated ? '/orders' : '/register'}
        className="h808-hdr__icon"
        aria-label="Cuenta"
      >
        <i className="fa-regular fa-user"></i>
      </Link>
      <Link to="/cart" className="h808-hdr__cart">
        <i className="fa-solid fa-bag-shopping"></i>
        <span>Carrito <span className="h808-hdr__cart__count">({cartCount})</span></span>
      </Link>
    </div>
  </header>
);

const Ticker = () => {
  const strip = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="h808-ticker">
      <div className="h808-ticker__track">
        {strip.map((t, i) => <span key={i}>{t}</span>)}
      </div>
    </div>
  );
};

const Hero = ({
  banner,
  slideIndex,
  slideCount,
  onPrev,
  onNext,
}: {
  banner: Banner | null;
  slideIndex: number;
  slideCount: number;
  onPrev: () => void;
  onNext: () => void;
}) => {
  const imageSrc = banner ? resolveImageUrl(banner.imageUrl) : HERO_FALLBACK_IMG;
  const kicker = banner?.label ?? 'DROP 04 · OTOÑO 2026';
  const title = banner?.title ?? 'NEW/ARRIVALS';
  const description =
    banner?.subtitle ??
    'Piezas diseñadas para quien no pide permiso. Entrega inmediata en Lima, envío a provincias en 48h.';
  const ctaText = banner?.ctaText ?? '¡Muéstrame más!';
  const ctaLink = banner?.ctaLink ?? '/productos';

  const splitTitle = title.includes('/')
    ? (() => {
        const [a, b] = title.split('/');
        return (
          <>
            {a}
            <span className="slash">/</span>
            {b}
          </>
        );
      })()
    : title;

  const currentIndex = slideCount > 0 ? slideIndex + 1 : 1;
  const totalIndex = slideCount > 0 ? slideCount : 1;

  return (
    <section className="h808-hero">
      <img className="h808-hero__img" src={imageSrc} alt={banner?.altText ?? ''} />
      <div className="h808-hero__overlay" />
      <div className="h808-hero__grid" />
      <div className="h808-hero__side">DROP 04 — 2026 · LIMA</div>
      <div className="h808-hero__content">
        <div className="h808-hero__meta">
          <span className="dot" />
          <span>{kicker}</span>
          <span style={{ color: '#3a3a3a' }}>/</span>
          <span>COLECCIÓN 24 PIEZAS</span>
        </div>
        <h1 className="h808-hero__title">{splitTitle}</h1>
        <p className="h808-hero__desc">{description}</p>
        <div className="h808-hero__ctas">
          <Link to={ctaLink} className="h808-hero__cta">
            <span>{ctaText}</span>
            <i className="fa-solid fa-arrow-right"></i>
          </Link>
          <Link to="/productos" className="h808-hero__cta h808-hero__cta--ghost">
            <span>Ver lookbook</span>
          </Link>
        </div>
      </div>
      {slideCount > 1 && (
        <div className="h808-hero__arrows">
          <button className="h808-hero__arrow" aria-label="Anterior" onClick={onPrev}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          <button className="h808-hero__arrow" aria-label="Siguiente" onClick={onNext}>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      )}
      <div className="h808-hero__counter">
        <span className="big">{String(currentIndex).padStart(2, '0')}</span>
        <span className="bar"></span>
        <span>{String(totalIndex).padStart(2, '0')}</span>
      </div>
    </section>
  );
};

const ProductCard = ({
  p,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  busy,
}: {
  p: Product;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  busy: boolean;
}) => {
  const price = parsePrice(p.price);
  const imgs = p.images?.slice().sort((a, b) => a.order - b.order) ?? [];
  const mainImg = imgs[0]?.imageUrl ? resolveImageUrl(imgs[0].imageUrl) : HERO_FALLBACK_IMG;
  const secondImg = imgs[1]?.imageUrl ? resolveImageUrl(imgs[1].imageUrl) : mainImg;
  const outOfStock = p.stock <= 0;

  return (
    <article className="h808-pcard">
      <Link to={`/productos/${p.id}`} className="h808-pcard__wrap" aria-label={p.name}>
        <img className="h808-pcard__img" src={mainImg} alt={p.name} />
        <img className="h808-pcard__img2" src={secondImg} alt="" />
        {p.featured && <span className="h808-pcard__badge">NEW</span>}
        {outOfStock && (
          <span
            className="h808-pcard__badge h808-pcard__badge--sale"
            style={{ top: p.featured ? 42 : 14 }}
          >
            AGOTADO
          </span>
        )}
      </Link>
      <button
        className="h808-pcard__fav"
        aria-label="Favorito"
        aria-pressed={isFavorite}
        onClick={(e) => {
          e.preventDefault();
          onToggleFavorite(p.id);
        }}
        style={isFavorite ? { background: 'var(--h-red)', borderColor: 'var(--h-red)', color: '#000' } : undefined}
      >
        <i className={isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
      </button>
      <button
        className="h808-pcard__add"
        disabled={busy || outOfStock}
        onClick={(e) => {
          e.preventDefault();
          if (!outOfStock) onAddToCart(p.id);
        }}
      >
        <i className="fa-solid fa-plus"></i>
        <span>{busy ? 'Agregando…' : outOfStock ? 'Sin stock' : 'Agregar'}</span>
      </button>
      <div className="h808-pcard__body">
        <div className="h808-pcard__cat">{p.category}</div>
        <h3 className="h808-pcard__name">
          <Link to={`/productos/${p.id}`} style={{ color: 'inherit' }}>{p.name}</Link>
        </h3>
        <div className="h808-pcard__price">
          <span className="h808-pcard__price-now">{fmtPEN(price)}</span>
        </div>
      </div>
    </article>
  );
};

const Featured = ({
  products,
  loading,
  error,
  favoriteIds,
  onToggleFavorite,
  onAddToCart,
  busyProductId,
}: {
  products: Product[];
  loading: boolean;
  error: string;
  favoriteIds: Set<string>;
  onToggleFavorite: (productId: string) => void;
  onAddToCart: (productId: string) => void;
  busyProductId: string | null;
}) => (
  <section className="h808-section">
    <div className="h808-section__head">
      <div>
        <div className="h808-section__kicker">Edición limitada</div>
        <h2 className="h808-section__title">Featured</h2>
      </div>
      <Link to="/productos" className="h808-section__cta">
        <span>Ver todos los productos</span>
        <i className="fa-solid fa-arrow-right"></i>
      </Link>
    </div>
    {loading && <p style={{ color: 'var(--h-fg-2)' }}>Cargando productos…</p>}
    {error && !loading && (
      <p style={{ color: 'var(--h-red)' }}>No se pudieron cargar los productos: {error}</p>
    )}
    {!loading && !error && products.length === 0 && (
      <p style={{ color: 'var(--h-fg-2)' }}>Aún no hay productos destacados.</p>
    )}
    {!loading && products.length > 0 && (
      <div className="h808-grid">
        {products.map((p) => (
          <ProductCard
            key={p.id}
            p={p}
            isFavorite={favoriteIds.has(p.id)}
            onToggleFavorite={onToggleFavorite}
            onAddToCart={onAddToCart}
            busy={busyProductId === p.id}
          />
        ))}
      </div>
    )}
  </section>
);

const SplitMarquee = ({ phrases }: { phrases: string[] }) => (
  <div className="h808-splitb__marquee">
    <div className="h808-splitb__track">
      {[...phrases, ...phrases].map((p, i) => (
        <Fragment key={i}>
          <span>{p}</span>
          <span className="sep">◆</span>
        </Fragment>
      ))}
    </div>
  </div>
);

const SpecialBanners = ({ banners }: { banners: Banner[] }) => {
  const [first, second] = banners;
  const firstImg = first ? resolveImageUrl(first.imageUrl) : SPLIT_BANNER_FALLBACKS[0];
  const secondImg = second ? resolveImageUrl(second.imageUrl) : SPLIT_BANNER_FALLBACKS[1];
  const firstTitle = first?.title ?? 'Colección Verano';
  const secondTitle = second?.title ?? 'Heavy Drop';
  const firstPhrases = [firstTitle, '808xHz', 'Drop 04', 'Hecho en Perú', 'Summer ·26', '808xHz'];
  const secondPhrases = [secondTitle, '808xHz', 'Heavy canvas', 'Sin repetición', 'Autumn · 26', '808xHz'];
  return (
    <section className="h808-section--split">
      <div className="h808-split">
        <div className="h808-splitb">
          <img className="h808-splitb__img" src={firstImg} alt="" />
          <div className="h808-splitb__overlay" />
          <div className="h808-splitb__tag"><span className="dot" /><span>{firstTitle}</span></div>
          <SplitMarquee phrases={firstPhrases} />
        </div>
        <div className="h808-splitb">
          <img className="h808-splitb__img" src={secondImg} alt="" />
          <div className="h808-splitb__overlay" />
          <div className="h808-splitb__tag"><span className="dot" /><span>{secondTitle}</span></div>
          <SplitMarquee phrases={secondPhrases} />
        </div>
      </div>
    </section>
  );
};

const SaleBanner = () => (
  <section className="h808-sale">
    <div className="h808-sale__bg" />
    <div className="h808-sale__watermark">SALE</div>
    <div className="h808-sale__content">
      <div className="h808-sale__kicker">Último llamado</div>
      <h2 className="h808-sale__title">FINAL DE<br />TEMPORADA<em>.</em></h2>
      <p className="h808-sale__desc">
        Últimas unidades de las colecciones 01–03 con hasta 60% de descuento. Sin reposición, sin
        esperas, sin drama.
      </p>
      <div className="h808-sale__actions">
        <Link to="/productos" className="h808-sale__btn">
          <span>Comprar ahora</span>
          <i className="fa-solid fa-arrow-right"></i>
        </Link>
      </div>
      <div className="h808-sale__countdown">
        <div className="h808-sale__unit"><div className="n">04</div><div className="l">Días</div></div>
        <div className="h808-sale__unit"><div className="n">18</div><div className="l">Horas</div></div>
        <div className="h808-sale__unit"><div className="n">32</div><div className="l">Min</div></div>
        <div className="h808-sale__unit"><div className="n">50</div><div className="l">Seg</div></div>
      </div>
    </div>
  </section>
);

const Categories = ({
  sections,
  loading,
  error,
}: {
  sections: BodySection[];
  loading: boolean;
  error: string;
}) => {
  const pool = sections.slice(0, 3);
  return (
    <section className="h808-section">
      <div className="h808-section__head">
        <div>
          <div className="h808-section__kicker">Navega por categoría</div>
          <h2 className="h808-section__title">Shop<br />by Drop</h2>
        </div>
        <Link to="/productos" className="h808-section__cta">
          <span>Todas las categorías</span>
          <i className="fa-solid fa-arrow-right"></i>
        </Link>
      </div>
      {loading && <p style={{ color: 'var(--h-fg-2)' }}>Cargando categorías…</p>}
      {error && !loading && (
        <p style={{ color: 'var(--h-red)' }}>No se pudieron cargar las categorías: {error}</p>
      )}
      {!loading && pool.length > 0 && (
        <div className="h808-cats">
          {pool.map((c, i) => (
            <Link
              to={`/productos?cat=${encodeURIComponent(c.category)}`}
              className="h808-cat"
              key={c.id}
            >
              <img className="h808-cat__img" src={resolveImageUrl(c.imageUrl)} alt={c.title} />
              <div className="h808-cat__overlay" />
              <div className="h808-cat__body">
                <div className="h808-cat__num">0{i + 1} — Drop</div>
                <h3 className="h808-cat__name">{c.title}</h3>
                <span className="h808-cat__btn">
                  <span>Ir a {c.title}</span>
                  <i className="fa-solid fa-arrow-right"></i>
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

const Footer808 = ({ categories }: { categories: string[] }) => (
  <footer className="h808-ft">
    <div className="h808-ft__top">
      <div className="h808-ft__brand">
        <BrandMark size={32} />
        <p className="h808-ft__tagline">
          Streetwear underground hecho en Perú. Ediciones limitadas, piezas sin repetición,
          carácter crudo.
        </p>
      </div>
      <div className="h808-ft__col">
        <h4>Tienda</h4>
        <ul>
          {categories.length > 0 ? (
            categories.map((cat) => (
              <li key={cat}>
                <Link to={`/productos?cat=${encodeURIComponent(cat)}`}>{cat}</Link>
              </li>
            ))
          ) : (
            <li><Link to="/productos">Todos los productos</Link></li>
          )}
          <li><Link to="/productos">Sale</Link></li>
        </ul>
      </div>
      <div className="h808-ft__col">
        <h4>Ayuda</h4>
        <ul>
          <li><a>Contacto</a></li>
          <li><a>Envíos</a></li>
          <li><a>Cambios</a></li>
          <li><a>Guía de tallas</a></li>
        </ul>
      </div>
      <div className="h808-ft__col">
        <h4>Empresa</h4>
        <ul>
          <li><a>Sobre 808xHz</a></li>
          <li><a>Lookbook</a></li>
          <li><a>Términos</a></li>
          <li><a>Privacidad</a></li>
        </ul>
      </div>
      <div className="h808-ft__news">
        <h4>Newsletter</h4>
        <p>Accede a drops antes que nadie y a códigos exclusivos.</p>
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
        <a><i className="fa-brands fa-whatsapp"></i></a>
      </div>
      <span className="h808-ft__loc">
        <i className="fa-solid fa-location-dot"></i> Lima · Perú
      </span>
    </div>
  </footer>
);

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [sbOpen, setSbOpen] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [busyProductId, setBusyProductId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const { products, loading: productsLoading, error: productsError } = useFeaturedProducts();
  const { banners, loading: bannersLoading } = useBanners();
  const { sections: bodySections, loading: sectionsLoading, error: sectionsError } = useBodySections();
  const { cartCount } = useCartData();

  useEffect(() => {
    document.body.classList.add('h808xhz-body');
    return () => {
      document.body.classList.remove('h808xhz-body');
    };
  }, []);

  useEffect(() => {
    if (banners.length === 0) return;
    if (slideIndex >= banners.length) setSlideIndex(0);
  }, [banners.length, slideIndex]);

  useEffect(() => {
    if (!isAuthenticated) {
      setFavoriteIds(new Set());
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const list = await favoritesService.list();
        if (!cancelled) setFavoriteIds(new Set(list.map((f) => f.productId)));
      } catch {
        if (!cancelled) setFavoriteIds(new Set());
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 2800);
    return () => clearTimeout(t);
  }, [feedback]);

  const activeBanners = useMemo(() => banners.filter((b) => b.isActive !== false), [banners]);
  const heroBanner = activeBanners[slideIndex] ?? null;
  const splitBanners = useMemo(() => {
    const rest = activeBanners.filter((_, i) => i !== slideIndex);
    return rest.length >= 2 ? rest.slice(0, 2) : activeBanners.slice(0, 2);
  }, [activeBanners, slideIndex]);

  const footerCategories = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.category).filter(Boolean))).slice(0, 5),
    [products],
  );

  const handlePrev = useCallback(() => {
    if (activeBanners.length === 0) return;
    setSlideIndex((i) => (i - 1 + activeBanners.length) % activeBanners.length);
  }, [activeBanners.length]);

  const handleNext = useCallback(() => {
    if (activeBanners.length === 0) return;
    setSlideIndex((i) => (i + 1) % activeBanners.length);
  }, [activeBanners.length]);

  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const id = setInterval(() => {
      setSlideIndex((i) => (i + 1) % activeBanners.length);
    }, 6000);
    return () => clearInterval(id);
  }, [activeBanners.length]);

  const handleAddToCart = useCallback(
    async (productId: string) => {
      try {
        setBusyProductId(productId);
        await cartService.addItem({ productId, quantity: 1, isAuthenticated });
        setFeedback({ kind: 'ok', text: 'Agregado al carrito' });
      } catch (err) {
        setFeedback({ kind: 'err', text: getApiErrorMessage(err) });
      } finally {
        setBusyProductId(null);
      }
    },
    [isAuthenticated],
  );

  const handleToggleFavorite = useCallback(
    async (productId: string) => {
      if (!isAuthenticated) {
        navigate('/register', { state: { from: { pathname: '/' } } });
        return;
      }
      const wasFavorite = favoriteIds.has(productId);
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFavorite) next.delete(productId);
        else next.add(productId);
        return next;
      });
      try {
        if (wasFavorite) await favoritesService.remove(productId);
        else await favoritesService.add(productId);
      } catch (err) {
        setFavoriteIds((prev) => {
          const next = new Set(prev);
          if (wasFavorite) next.add(productId);
          else next.delete(productId);
          return next;
        });
        setFeedback({ kind: 'err', text: getApiErrorMessage(err) });
      }
    },
    [favoriteIds, isAuthenticated, navigate],
  );

  return (
    <div className="h808">
      <Sidebar open={sbOpen} onClose={() => setSbOpen(false)} categories={footerCategories} />
      <Header808
        cartCount={cartCount}
        onBurger={() => setSbOpen(true)}
        isAuthenticated={isAuthenticated}
      />
      <Ticker />
      <Hero
        banner={bannersLoading ? null : heroBanner}
        slideIndex={slideIndex}
        slideCount={activeBanners.length}
        onPrev={handlePrev}
        onNext={handleNext}
      />
      <Featured
        products={products}
        loading={productsLoading}
        error={productsError}
        favoriteIds={favoriteIds}
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
        busyProductId={busyProductId}
      />
      <SpecialBanners banners={splitBanners} />
      <SaleBanner />
      <Categories
        sections={bodySections}
        loading={sectionsLoading}
        error={sectionsError}
      />
      <Footer808 categories={footerCategories} />
      {feedback && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            right: 24,
            bottom: 24,
            zIndex: 200,
            padding: '14px 20px',
            background: feedback.kind === 'ok' ? 'var(--h-red)' : '#7a1a14',
            color: '#000',
            fontFamily: 'var(--h-font-body)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            boxShadow: '0 10px 30px rgba(0,0,0,.5)',
          }}
        >
          {feedback.text}
        </div>
      )}
    </div>
  );
};
