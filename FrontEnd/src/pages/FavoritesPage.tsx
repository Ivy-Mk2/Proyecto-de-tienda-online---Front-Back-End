import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiErrorMessage } from '../hooks/useApiError';
import { cartService } from '../services/cart.service';
import { favoritesService } from '../services/favorites.service';
import { productsService } from '../services/products.service';
import { resolveImageUrl } from '../lib/api/imageUrl';
import { Shell808 } from '../components/Shell808/Shell808';
import type { Product } from '../types/api';

const fmtPEN = (n: number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(n);

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=900&q=80';

export const FavoritesPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([favoritesService.list(), productsService.list()])
      .then(([favs, allProducts]) => {
        if (cancelled) return;
        const ids = new Set(favs.map((f) => f.productId));
        setFavoriteIds(ids);
        setProducts(allProducts.filter((p) => ids.has(p.id)));
        setError('');
      })
      .catch((err) => { if (!cancelled) setError(getApiErrorMessage(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 2800);
    return () => clearTimeout(t);
  }, [feedback]);

  const handleRemove = useCallback(async (productId: string) => {
    try {
      setBusyId(productId);
      await favoritesService.remove(productId);
      setFavoriteIds((prev) => { const n = new Set(prev); n.delete(productId); return n; });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      setFeedback({ kind: 'err', text: getApiErrorMessage(err) });
    } finally {
      setBusyId(null);
    }
  }, []);

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

  const handleAddAll = async () => {
    for (const p of products) {
      if (p.stock > 0) {
        await cartService.addItem({ productId: p.id, quantity: 1, isAuthenticated }).catch(() => null);
      }
    }
    setFeedback({ kind: 'ok', text: 'Todos los productos disponibles agregados al carrito' });
  };

  return (
    <Shell808>
      <div className="favs">
        <div className="favs__hdr">
          <div>
            <h1>Favoritos <span style={{ color: 'var(--red)' }}>({products.length})</span></h1>
            <div className="sub">
              Piezas guardadas{products.filter((p) => p.stock < 5 && p.stock > 0).length > 0 ? ` · ${products.filter((p) => p.stock < 5 && p.stock > 0).length} con stock bajo` : ''}
            </div>
          </div>
          {products.length > 0 && (
            <div className="favs__tools">
              <button className="favs__tool" onClick={() => void handleAddAll()}>
                <i className="fa-solid fa-bag-shopping"></i>Agregar todo
              </button>
            </div>
          )}
        </div>

        {loading && <p style={{ color: 'var(--fg-2)', padding: '40px 0' }}>Cargando favoritos…</p>}
        {error && <p style={{ color: 'var(--red)', padding: '20px 0' }}>{error}</p>}

        {!loading && products.length === 0 && !error && (
          <div className="favs__empty">
            <i className="fa-regular fa-heart"></i>
            <h3>No tienes favoritos</h3>
            <p>Agrega piezas que te interesen para guardarlas aquí.</p>
            <Link to="/productos" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginTop: 24, background: 'var(--red)', color: '#000', padding: '14px 28px', fontSize: 12, letterSpacing: '0.2em', textTransform: 'uppercase', fontWeight: 700, textDecoration: 'none' }}>
              <span>Explorar productos</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="favs__grid">
            {products.map((p) => {
              const imgs = p.images?.slice().sort((a, b) => a.order - b.order) ?? [];
              const img = imgs[0]?.imageUrl ? resolveImageUrl(imgs[0].imageUrl) : FALLBACK_IMG;
              const price = parseFloat(p.price);
              const lowStock = p.stock < 5 && p.stock > 0;
              const outOfStock = p.stock <= 0;
              return (
                <article className="fav" key={p.id}>
                  <div className="fav__wrap">
                    <img src={img} alt={p.name} />
                    <button
                      className="fav__rem"
                      aria-label="Quitar de favoritos"
                      onClick={() => void handleRemove(p.id)}
                      disabled={busyId === p.id}
                    >
                      <i className="fa-solid fa-xmark"></i>
                    </button>
                    {!outOfStock && (
                      <button
                        className="fav__add"
                        onClick={() => void handleAddToCart(p.id)}
                        disabled={busyId === p.id}
                      >
                        <i className="fa-solid fa-bag-shopping"></i>
                        {busyId === p.id ? 'Agregando…' : 'Agregar al carrito'}
                      </button>
                    )}
                    <span className={`fav__stock${lowStock ? ' fav__stock--low' : ''}`}>
                      {outOfStock ? 'Agotado' : lowStock ? `Últimas ${p.stock}` : 'En stock'}
                    </span>
                  </div>
                  <div className="fav__body">
                    <div className="fav__cat">{p.category}</div>
                    <h3 className="fav__name">
                      <Link to={`/productos/${p.id}`} style={{ color: 'inherit' }}>{p.name}</Link>
                    </h3>
                    <div className="fav__price">
                      <span className="now">{fmtPEN(price)}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {feedback && (
        <div role="status" style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 200, padding: '14px 20px', background: feedback.kind === 'ok' ? 'var(--h-red)' : '#7a1a14', color: '#000', fontFamily: 'var(--h-font-body)', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          {feedback.text}
        </div>
      )}
    </Shell808>
  );
};
