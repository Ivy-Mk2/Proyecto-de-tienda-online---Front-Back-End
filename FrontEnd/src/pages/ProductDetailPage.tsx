import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
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

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [thumbIdx, setThumbIdx] = useState(0);
  const [size, setSize] = useState('');
  const [qty, setQty] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addBusy, setAddBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      productsService.getById(id),
      productsService.list(),
    ])
      .then(([p, all]) => {
        setProduct(p);
        setRelated(all.filter((x) => x.id !== id).slice(0, 4));
        if (p.sizes.length > 0) setSize(p.sizes[0]);
        setError('');
      })
      .catch((err) => setError(getApiErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    let cancelled = false;
    favoritesService.list()
      .then((list) => { if (!cancelled) setIsFavorite(list.some((f) => f.productId === id)); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [isAuthenticated, id]);

  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 2800);
    return () => clearTimeout(t);
  }, [feedback]);

  const handleAddToCart = useCallback(async () => {
    if (!product) return;
    try {
      setAddBusy(true);
      await cartService.addItem({ productId: product.id, quantity: qty, isAuthenticated });
      setFeedback({ kind: 'ok', text: 'Agregado al carrito' });
    } catch (err) {
      setFeedback({ kind: 'err', text: getApiErrorMessage(err) });
    } finally {
      setAddBusy(false);
    }
  }, [product, qty, isAuthenticated]);

  const handleToggleFav = useCallback(async () => {
    if (!isAuthenticated) {
      navigate('/register', { state: { from: { pathname: `/productos/${id}` } } });
      return;
    }
    const wasFav = isFavorite;
    setIsFavorite(!wasFav);
    try {
      if (wasFav) await favoritesService.remove(id!);
      else await favoritesService.add(id!);
    } catch {
      setIsFavorite(wasFav);
    }
  }, [isAuthenticated, isFavorite, id, navigate]);

  if (loading) return (
    <Shell808>
      <div style={{ padding: '80px 72px', color: 'var(--fg-2)', fontFamily: 'var(--font-body)' }}>Cargando producto…</div>
    </Shell808>
  );

  if (error || !product) return (
    <Shell808>
      <div style={{ padding: '80px 72px', color: 'var(--red)', fontFamily: 'var(--font-body)' }}>
        {error || 'Producto no encontrado.'}
      </div>
    </Shell808>
  );

  const imgs = product.images?.slice().sort((a, b) => a.order - b.order) ?? [];
  const thumbs = imgs.length > 0
    ? imgs.map((img) => resolveImageUrl(img.imageUrl))
    : [FALLBACK_IMG, FALLBACK_IMG, FALLBACK_IMG, FALLBACK_IMG];
  const price = parseFloat(product.price);
  const outOfStock = product.stock <= 0;
  const maxQty = Math.min(product.stock, 5);

  return (
    <Shell808>
      <div className="pdp">
        <div className="pdp__crumbs">
          <Link to="/" style={{ color: 'var(--fg-2)' }}>Inicio</Link>
          <span className="sep">/</span>
          <Link to="/productos" style={{ color: 'var(--fg-2)' }}>Productos</Link>
          <span className="sep">/</span>
          {product.category && (
            <>
              <Link to={`/productos?cat=${encodeURIComponent(product.category)}`} style={{ color: 'var(--fg-2)' }}>
                {product.category}
              </Link>
              <span className="sep">/</span>
            </>
          )}
          <span className="current">{product.name}</span>
        </div>

        <div className="pdp__cols">
          <div className="pdp__thumbs">
            {thumbs.slice(0, 4).map((src, i) => (
              <div key={i} className="pdp__thumb" aria-current={thumbIdx === i ? 'true' : undefined} onClick={() => setThumbIdx(i)}>
                <img src={src} alt="" />
              </div>
            ))}
          </div>

          <div className="pdp__gallery">
            <div className="pdp__main pdp__main--tall">
              <img src={thumbs[thumbIdx] ?? FALLBACK_IMG} alt={product.name} />
              {outOfStock && <span className="pdp__mark">AGOTADO</span>}
              <button className="pdp__zoom"><i className="fa-solid fa-expand"></i></button>
            </div>
            {thumbs[1] && <div className="pdp__main"><img src={thumbs[1]} alt="" /></div>}
            {thumbs[2] && <div className="pdp__main"><img src={thumbs[2]} alt="" /></div>}
          </div>

          <div className="pdp__info">
            <div className="pdp__cat">{product.category} · Drop 04</div>
            <h1 className="pdp__name">{product.name}</h1>
            <div className="pdp__rating">
              <span className="stars">★★★★★</span>
              <span>4.9</span>
              <span style={{ color: 'var(--fg-3)' }}>·</span>
              <a style={{ cursor: 'pointer' }}>128 reseñas</a>
              <span style={{ color: 'var(--fg-3)' }}>·</span>
              <span>{outOfStock ? 'Sin stock' : product.stock < 5 ? 'Stock bajo' : 'En stock'}</span>
            </div>

            <div className="pdp__prices">
              <span className="pdp__price-now">{fmtPEN(price)}</span>
            </div>

            {product.sizes && product.sizes.length > 0 && (
              <div className="pdp__group">
                <div className="pdp__group-hdr">
                  <div className="pdp__group-label">Talla</div>
                  <a className="pdp__guide">Guía de tallas ↗</a>
                </div>
                <div className="pdp__sizes">
                  {product.sizes.map((s) => (
                    <button key={s} className="pdp__size"
                      aria-pressed={size === s ? 'true' : 'false'}
                      onClick={() => setSize(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors && product.colors.length > 0 && (
              <div className="pdp__group">
                <div className="pdp__group-hdr">
                  <div className="pdp__group-label">Color</div>
                </div>
                <div className="pdp__sizes">
                  {product.colors.map((c) => (
                    <button key={c} className="pdp__size" style={{ fontSize: 11, minWidth: 72 }}>{c}</button>
                  ))}
                </div>
              </div>
            )}

            {!outOfStock && (
              <div className="pdp__group">
                <div className="pdp__group-hdr">
                  <div className="pdp__group-label">Cantidad</div>
                  <span style={{ fontSize: 11, color: 'var(--fg-3)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {product.stock} disponibles
                  </span>
                </div>
                <div className="pdp__qty-wrap">
                  <button onClick={() => setQty(Math.max(1, qty - 1))}>
                    <i className="fa-solid fa-minus"></i>
                  </button>
                  <span>{String(qty).padStart(2, '0')}</span>
                  <button onClick={() => setQty(Math.min(maxQty, qty + 1))}>
                    <i className="fa-solid fa-plus"></i>
                  </button>
                </div>
              </div>
            )}

            <div className="pdp__actions">
              <button className="pdp__add" onClick={() => void handleAddToCart()} disabled={addBusy || outOfStock}>
                <i className="fa-solid fa-bag-shopping"></i>
                <span>{addBusy ? 'Agregando…' : outOfStock ? 'Sin stock' : 'Agregar al carrito'}</span>
              </button>
              <button
                className={`pdp__fav-btn${isFavorite ? ' active' : ''}`}
                onClick={() => void handleToggleFav()}
              >
                <i className={isFavorite ? 'fa-solid fa-heart' : 'fa-regular fa-heart'}></i>
              </button>
            </div>
            <div className="pdp__actions" style={{ marginTop: 0 }}>
              <Link to="/cart" className="pdp__buy" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                <span>Ir al carrito</span>
                <i className="fa-solid fa-arrow-right"></i>
              </Link>
            </div>

            <div className="pdp__perks">
              <div className="pdp__perk"><i className="fa-solid fa-truck"></i><div><b>Envío gratis</b><span>Compras +S/ 200</span></div></div>
              <div className="pdp__perk"><i className="fa-solid fa-rotate-left"></i><div><b>30 días</b><span>Cambios fáciles</span></div></div>
              <div className="pdp__perk"><i className="fa-solid fa-shield-halved"></i><div><b>Pago seguro</b><span>Tarjeta · Yape · Plin</span></div></div>
              <div className="pdp__perk"><i className="fa-solid fa-hand-holding-heart"></i><div><b>Hecho en Perú</b><span>Producción ética</span></div></div>
            </div>
          </div>
        </div>

        <div className="pdp__desc">
          <h2>Descripción<br />del producto</h2>
          <div className="pdp__desc-body">
            <p>{product.description || 'Sin descripción disponible.'}</p>
            <ul className="pdp__specs">
              {product.sizes.length > 0 && <li><b>Tallas</b><span>{product.sizes.join(', ')}</span></li>}
              {product.colors.length > 0 && <li><b>Colores</b><span>{product.colors.join(', ')}</span></li>}
              <li><b>Stock</b><span>{product.stock} unidades</span></li>
              <li><b>Categoría</b><span>{product.category}</span></li>
              <li><b>Cuidado</b><span>Lavar al revés en frío · no usar secadora</span></li>
            </ul>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <div className="pdp__related">
          <div className="h808-section__head" style={{ marginBottom: 40 }}>
            <div>
              <div className="h808-section__kicker">Seguir explorando</div>
              <h2 className="h808-section__title">Quizás te<br />puedan interesar</h2>
            </div>
            <Link to="/productos" className="h808-section__cta">
              <span>Ver toda la colección</span>
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>
          <div className="h808-grid">
            {related.map((p) => {
              const rImgs = p.images?.slice().sort((a, b) => a.order - b.order) ?? [];
              const rImg = rImgs[0]?.imageUrl ? resolveImageUrl(rImgs[0].imageUrl) : FALLBACK_IMG;
              return (
                <article key={p.id} className="h808-pcard">
                  <Link to={`/productos/${p.id}`} className="h808-pcard__wrap">
                    <img className="h808-pcard__img" src={rImg} alt={p.name} />
                  </Link>
                  <div className="h808-pcard__body">
                    <div className="h808-pcard__cat">{p.category}</div>
                    <h3 className="h808-pcard__name"><Link to={`/productos/${p.id}`} style={{ color: 'inherit' }}>{p.name}</Link></h3>
                    <div className="h808-pcard__price">
                      <span className="h808-pcard__price-now">{fmtPEN(parseFloat(p.price))}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      )}

      {feedback && (
        <div role="status" style={{ position: 'fixed', right: 24, bottom: 24, zIndex: 200, padding: '14px 20px', background: feedback.kind === 'ok' ? 'var(--h-red)' : '#7a1a14', color: '#000', fontFamily: 'var(--h-font-body)', fontSize: 12, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
          {feedback.text}
        </div>
      )}
    </Shell808>
  );
};
