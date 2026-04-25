import { Fragment, useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCartData } from '../hooks/useCartData';
import { getApiErrorMessage } from '../hooks/useApiError';
import { cartService } from '../services/cart.service';
import { favoritesService } from '../services/favorites.service';
import { productsService } from '../services/products.service';
import { resolveImageUrl } from '../lib/api/imageUrl';
import { Shell808 } from '../components/Shell808/Shell808';
import type { Product } from '../types/api';

const fmtPEN = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const COLORS = ['#0a0a0a', '#ffffff', '#d94a2f', '#4a4a4a', '#d9d4ca', '#1a3b7a', '#3b6b3b', '#7a5a3a'];
const CATEGORIES = ['Todo', 'Polos', 'Poleras', 'Pantalones', 'Zapatillas', 'Accesorios'];
const SORT_OPTIONS = ['Más nuevos', 'Precio: menor a mayor', 'Precio: mayor a menor', 'Nombre A–Z'];

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80';

function ProductCard({
  p,
  isFavorite,
  onFav,
  onAdd,
  busy,
}: {
  p: Product;
  isFavorite: boolean;
  onFav: (id: string) => void;
  onAdd: (id: string) => void;
  busy: boolean;
}) {
  const imgs = p.images?.slice().sort((a, b) => a.order - b.order) ?? [];
  const img1 = imgs[0]?.imageUrl ? resolveImageUrl(imgs[0].imageUrl) : FALLBACK_IMG;
  const img2 = imgs[1]?.imageUrl ? resolveImageUrl(imgs[1].imageUrl) : img1;
  const price = parseFloat(p.price);
  const outOfStock = p.stock <= 0;

  return (
    <article className="h808-pcard">
      <Link to={`/productos/${p.id}`} className="h808-pcard__wrap">
        <img className="h808-pcard__img" src={img1} alt={p.name} />
        <img className="h808-pcard__img2" src={img2} alt="" />
        {p.featured && <span className="h808-pcard__badge">NEW</span>}
        {outOfStock && <span className="h808-pcard__badge h808-pcard__badge--sale" style={{ top: p.featured ? 42 : 14 }}>AGOTADO</span>}
      </Link>
      <button
        className="h808-pcard__fav"
        aria-label="Favorito"
        aria-pressed={isFavorite}
        onClick={() => onFav(p.id)}
        style={isFavorite ? { background: 'var(--h-red)', borderColor: 'var(--h-red)', color: '#000' } : undefined}
      >
        <i className={isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
      </button>
      <button
        className="h808-pcard__add"
        disabled={busy || outOfStock}
        onClick={() => { if (!outOfStock) onAdd(p.id); }}
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
}

export const ProductsPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCat = searchParams.get('cat') ?? 'Todo';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColorIdx, setSelectedColorIdx] = useState<number | null>(null);
  const [sortIdx, setSortIdx] = useState(0);
  const [gridView, setGridView] = useState(true);
  const [sortOpen, setSortOpen] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const { cartCount: _cartCount } = useCartData();

  useEffect(() => {
    setLoading(true);
    const cat = selectedCat === 'Todo' ? undefined : selectedCat;
    productsService.list({ category: cat })
      .then((data) => { setProducts(data); setError(''); })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [selectedCat]);

  useEffect(() => {
    if (!isAuthenticated) { setFavoriteIds(new Set()); return; }
    let cancelled = false;
    favoritesService.list()
      .then((list) => { if (!cancelled) setFavoriteIds(new Set(list.map((f) => f.productId))); })
      .catch(() => { if (!cancelled) setFavoriteIds(new Set()); });
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 2800);
    return () => clearTimeout(t);
  }, [feedback]);

  const handleAddToCart = useCallback(async (productId: string) => {
    try {
      setBusyId(productId);
      await cartService.addItem({ productId, quantity: 1, isAuthenticated });
      setFeedback({ kind: 'ok', text: 'Agregado al carrito' });
    } catch (err) {
      setFeedback({ kind: 'err', text: getApiErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }, [isAuthenticated]);

  const handleToggleFav = useCallback(async (productId: string) => {
    if (!isAuthenticated) {
      navigate('/register', { state: { from: { pathname: '/productos' } } });
      return;
    }
    const wasFav = favoriteIds.has(productId);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (wasFav) next.delete(productId); else next.add(productId);
      return next;
    });
    try {
      if (wasFav) await favoritesService.remove(productId);
      else await favoritesService.add(productId);
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (wasFav) next.add(productId); else next.delete(productId);
        return next;
      });
    }
  }, [favoriteIds, isAuthenticated, navigate]);

  const setCat = (cat: string) => setSearchParams(cat === 'Todo' ? {} : { cat });

  const toggleSize = (s: string) =>
    setSelectedSizes((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);

  let sorted = [...products];
  if (sortIdx === 1) sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  else if (sortIdx === 2) sorted.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
  else if (sortIdx === 3) sorted.sort((a, b) => a.name.localeCompare(b.name));

  const activeCats = selectedCat !== 'Todo' ? [selectedCat] : [];
  const activeSizes = selectedSizes.map((s) => `Talla · ${s}`);
  const activeFilters = [...activeCats, ...activeSizes];

  return (
    <Shell808>
      <div className="plp">
        <div className="plp__header">
          <div>
            <h1 className="plp__title">All Products</h1>
            <div className="plp__meta">
              {selectedCat !== 'Todo' ? `${selectedCat} · ` : ''}{products.length} piezas disponibles
            </div>
          </div>
          <div className="plp__tools">
            <div style={{ position: 'relative' }}>
              <button className="plp__sort" onClick={() => setSortOpen((o) => !o)}>
                <span>Ordenar: {SORT_OPTIONS[sortIdx]}</span>
                <i className="fa-solid fa-chevron-down"></i>
              </button>
              {sortOpen && (
                <div style={{ position: 'absolute', top: '100%', right: 0, zIndex: 10, background: 'var(--bg-1)', border: '1px solid var(--line-2)', minWidth: 220 }}>
                  {SORT_OPTIONS.map((opt, i) => (
                    <button key={opt} onClick={() => { setSortIdx(i); setSortOpen(false); }}
                      style={{ display: 'block', width: '100%', padding: '12px 16px', background: i === sortIdx ? 'var(--bg-3)' : 'transparent', border: 'none', color: '#fff', fontSize: 12, letterSpacing: '0.12em', textAlign: 'left', cursor: 'pointer', textTransform: 'uppercase' }}>
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="plp__view">
              <button aria-pressed={gridView ? 'true' : 'false'} onClick={() => setGridView(true)}><i className="fa-solid fa-grid-horizontal"></i></button>
              <button aria-pressed={!gridView ? 'true' : 'false'} onClick={() => setGridView(false)}><i className="fa-solid fa-list"></i></button>
            </div>
          </div>
        </div>

        <div className="plp__body">
          <aside className="filters">
            <div className="filters__sect">
              <div className="filters__title">Categoría <i className="fa-solid fa-minus"></i></div>
              <div className="filters__list">
                {CATEGORIES.map((cat) => (
                  <label className="filters__row" key={cat} style={{ cursor: 'pointer' }} onClick={() => setCat(cat)}>
                    <span>
                      <input type="checkbox" readOnly checked={selectedCat === cat || (cat === 'Todo' && selectedCat === 'Todo')} style={{ marginRight: 10, accentColor: 'var(--red)' }} />
                      {cat}
                    </span>
                    <span className="count">({cat === 'Todo' ? products.length : products.filter((p) => p.category === cat).length})</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filters__sect">
              <div className="filters__title">Talla <i className="fa-solid fa-minus"></i></div>
              <div className="filters__chips">
                {SIZES.map((s) => (
                  <button key={s} className="filters__chip"
                    aria-pressed={selectedSizes.includes(s) ? 'true' : 'false'}
                    onClick={() => toggleSize(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className="filters__sect">
              <div className="filters__title">Color <i className="fa-solid fa-minus"></i></div>
              <div className="filters__colors">
                {COLORS.map((c, i) => (
                  <button key={i} className="filters__color" style={{ background: c }}
                    aria-pressed={selectedColorIdx === i ? 'true' : 'false'}
                    onClick={() => setSelectedColorIdx(selectedColorIdx === i ? null : i)} />
                ))}
              </div>
            </div>

            <div className="filters__sect">
              <div className="filters__title">Disponibilidad <i className="fa-solid fa-minus"></i></div>
              <div className="filters__list">
                <label className="filters__row"><span><input type="checkbox" defaultChecked style={{ marginRight: 10, accentColor: 'var(--red)' }} />En stock</span><span className="count">({products.filter((p) => p.stock > 0).length})</span></label>
                <label className="filters__row"><span><input type="checkbox" style={{ marginRight: 10 }} />Sin stock</span><span className="count">({products.filter((p) => p.stock <= 0).length})</span></label>
              </div>
            </div>

            <button className="filters__clear" onClick={() => { setCat('Todo'); setSelectedSizes([]); setSelectedColorIdx(null); }}>
              Limpiar filtros
            </button>
          </aside>

          <div>
            {activeFilters.length > 0 && (
              <div className="plp__active">
                {activeFilters.map((f) => (
                  <span key={f} className="plp__active-chip" onClick={() => {
                    if (CATEGORIES.includes(f)) setCat('Todo');
                    else if (f.startsWith('Talla')) setSelectedSizes([]);
                  }}>
                    {f} <i className="fa-solid fa-xmark"></i>
                  </span>
                ))}
              </div>
            )}

            {loading && <p style={{ color: 'var(--fg-2)', padding: '40px 0' }}>Cargando productos…</p>}
            {error && <p style={{ color: 'var(--red)', padding: '40px 0' }}>{error}</p>}

            {!loading && !error && (
              <>
                <div className={gridView ? 'plp__grid3' : ''} style={!gridView ? { display: 'flex', flexDirection: 'column', gap: 1 } : undefined}>
                  {sorted.map((p) => (
                    <ProductCard
                      key={p.id}
                      p={p}
                      isFavorite={favoriteIds.has(p.id)}
                      onFav={handleToggleFav}
                      onAdd={handleAddToCart}
                      busy={busyId === p.id}
                    />
                  ))}
                  {sorted.length === 0 && (
                    <p style={{ color: 'var(--fg-2)', gridColumn: '1/-1', padding: '60px 0' }}>
                      No hay productos que coincidan con los filtros.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {feedback && (
        <div role="status" style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 200, padding: '14px 20px', background: feedback.kind === 'ok' ? 'var(--h-red)' : '#7a1a14', color: '#000', fontFamily: 'var(--h-font-body)', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          {feedback.text}
        </div>
      )}
    </Shell808>
  );
};
