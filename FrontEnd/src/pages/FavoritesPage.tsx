import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { favoritesService } from '../services/favorites.service';
import { productsService } from '../services/products.service';
import { cartService } from '../services/cart.service';
import { Product } from '../types/api';
import { getApiErrorMessage } from '../hooks/useApiError';
import { resolveImageUrl } from '../lib/api/imageUrl';
import { useAuth } from '../context/AuthContext';
import './FavoritesPage.css';

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(price));

export const FavoritesPage = () => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError('');
      const favs = await favoritesService.list();

      if (!favs.length) {
        setProducts([]);
        return;
      }

      const productResults = await Promise.allSettled(
        favs.map((f) => productsService.getById(f.productId)),
      );

      const resolved = productResults
        .filter((r): r is PromiseFulfilledResult<Product> => r.status === 'fulfilled')
        .map((r) => r.value);

      setProducts(resolved);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const onRemove = async (productId: string) => {
    try {
      setRemoving(productId);
      await favoritesService.remove(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setRemoving(null);
    }
  };

  const onAddToCart = async (productId: string) => {
    try {
      await cartService.addItem({ productId, quantity: 1, isAuthenticated });
    } catch {
      // silencioso: no interrumpir UX de favoritos
    }
  };

  if (loading) {
    return (
      <main className="container">
        <h1 className="favs-title">Mis favoritos</h1>
        <div className="favs-grid">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="favs-skeleton" />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="container">
      <h1 className="favs-title">Mis favoritos</h1>

      {error ? <p className="error">{error}</p> : null}

      {!error && products.length === 0 ? (
        <div className="favs-empty">
          <i className="fa-regular fa-heart favs-empty__icon" />
          <p>No tienes productos favoritos aún.</p>
          <Link to="/productos" className="favs-empty__cta">
            Explorar productos
          </Link>
        </div>
      ) : null}

      {products.length > 0 ? (
        <div className="favs-grid">
          {products.map((product) => {
            const image = resolveImageUrl(product.images[0]?.imageUrl);
            return (
              <article key={product.id} className="favs-card">
                <Link to={`/productos/${product.id}`} className="favs-card__image-link">
                  {image ? (
                    <img
                      src={image}
                      alt={product.images[0]?.altText ?? product.name}
                      className="favs-card__img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="favs-card__placeholder">Sin imagen</div>
                  )}
                </Link>

                <div className="favs-card__body">
                  <Link to={`/productos/${product.id}`} className="favs-card__name">
                    {product.name}
                  </Link>
                  <p className="favs-card__price">{formatPrice(product.price)}</p>
                  <p className="favs-card__category">{product.category}</p>

                  <div className="favs-card__actions">
                    <button
                      className="favs-card__btn favs-card__btn--cart"
                      onClick={() => void onAddToCart(product.id)}
                    >
                      Agregar al carrito
                    </button>
                    <button
                      className="favs-card__btn favs-card__btn--remove"
                      onClick={() => void onRemove(product.id)}
                      disabled={removing === product.id}
                      aria-label="Quitar de favoritos"
                    >
                      {removing === product.id ? '...' : <i className="fa-solid fa-trash" />}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </main>
  );
};
