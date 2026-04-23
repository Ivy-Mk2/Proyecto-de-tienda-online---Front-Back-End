import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { cartService } from '../../services/cart.service';
import { favoritesService } from '../../services/favorites.service';
import { productService } from '../../services/products.service';
import { Product } from '../../types/api';
import { getApiErrorMessage } from '../../hooks/useApiError';
import { useAuth } from '../../context/AuthContext';
import { resolveImageUrl } from '../../lib/api/imageUrl';
import './Featured.css';

const formatPrice = (price: string | number) => {
  const parsed = Number(price);
  if (Number.isNaN(parsed)) return String(price);

  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(parsed);
};

const getPreviousPrice = (product: Product): string | null => {
  const flexibleProduct = product as Product & {
    previousPrice?: string | number | null;
    compareAtPrice?: string | number | null;
    oldPrice?: string | number | null;
    originalPrice?: string | number | null;
  };

  const previous =
    flexibleProduct.previousPrice ??
    flexibleProduct.compareAtPrice ??
    flexibleProduct.oldPrice ??
    flexibleProduct.originalPrice;

  return previous ? String(previous) : null;
};

const Featured = () => {
  const { isAuthenticated } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  const loadFeatured = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const featuredProducts = await productService.getFeaturedProducts();
      setProducts(featuredProducts);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFeatured();
  }, [loadFeatured]);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!isAuthenticated) {
        setFavoriteIds([]);
        return;
      }

      try {
        const favorites = await favoritesService.list();
        setFavoriteIds(favorites.map((favorite) => favorite.productId));
      } catch {
        setFavoriteIds([]);
      }
    };

    void loadFavorites();
  }, [isAuthenticated]);

  const skeletonItems = useMemo(() => Array.from({ length: 6 }, (_, index) => `skeleton-${index}`), []);

  const handleAddToCart = async (productId: string) => {
    try {
      await cartService.addItem({
        productId,
        quantity: 1,
        isAuthenticated,
      });
    } catch {
      // La UI principal no debe romperse si falla esta acción secundaria.
    }
  };

  const handleToggleFavorite = async (productId: string) => {
    if (!isAuthenticated) return;

    const isFavorite = favoriteIds.includes(productId);

    setFavoriteIds((prev) =>
      isFavorite ? prev.filter((favoriteId) => favoriteId !== productId) : [...prev, productId],
    );

    try {
      if (isFavorite) {
        await favoritesService.remove(productId);
      } else {
        await favoritesService.add(productId);
      }
    } catch {
      setFavoriteIds((prev) =>
        isFavorite ? [...prev, productId] : prev.filter((favoriteId) => favoriteId !== productId),
      );
    }
  };

  return (
    <section className="featured-section" aria-label="Productos destacados">
      <div className="featured-section__header">
        <h2 className="featured-section__title">FEATURED</h2>
      </div>

      {loading ? (
        <div className="featured-grid" aria-hidden="true">
          {skeletonItems.map((itemId) => (
            <article className="featured-card featured-card--skeleton" key={itemId}>
              <div className="featured-card__image" />
              <div className="featured-card__line featured-card__line--title" />
              <div className="featured-card__line featured-card__line--price" />
            </article>
          ))}
        </div>
      ) : null}

      {!loading && error ? (
        <div className="featured-section__fallback" role="status">
          <p>No se pudieron cargar los destacados: {error}</p>
          <button type="button" onClick={() => void loadFeatured()}>
            Reintentar
          </button>
        </div>
      ) : null}

      {!loading && !error ? (
        products.length ? (
          <div className="featured-grid">
            {products.map((product) => {
              const primaryImage = resolveImageUrl(product.images[0]?.imageUrl);
              const secondaryImage = resolveImageUrl(product.images[1]?.imageUrl ?? product.images[0]?.imageUrl);
              const previousPrice = getPreviousPrice(product);
              const isFavorite = favoriteIds.includes(product.id);

              return (
                <article className="featured-card" key={product.id}>
                  <div className="featured-card__image-wrap">
                    <div className="featured-card__image-stack">
                      {primaryImage ? (
                        <img
                          className="featured-card__image featured-card__image--primary"
                          src={primaryImage}
                          alt={product.images[0]?.altText ?? product.name}
                          loading="lazy"
                        />
                      ) : (
                        <div className="featured-card__placeholder">Sin imagen</div>
                      )}

                      {secondaryImage ? (
                        <img
                          className="featured-card__image featured-card__image--secondary"
                          src={secondaryImage}
                          alt={product.images[1]?.altText ?? product.name}
                          loading="lazy"
                        />
                      ) : null}
                    </div>

                    <div className="featured-card__overlay-actions">
                      <button
                        type="button"
                        aria-label="Añadir a favoritos"
                        onClick={() => void handleToggleFavorite(product.id)}
                      >
                        <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                      </button>
                      <button
                        type="button"
                        aria-label="Agregar al carrito"
                        onClick={() => void handleAddToCart(product.id)}
                      >
                        <i className="fa-solid fa-cart-shopping"></i>
                      </button>
                      <button type="button" aria-label="Ver más opciones">
                        <i className="fa-solid fa-share-nodes"></i>
                      </button>
                    </div>
                  </div>

                  <div className="featured-card__content">
                    <Link to={`/productos/${product.id}`} className="featured-card__name-link">
                      <h3>{product.name}</h3>
                    </Link>
                    <p className="featured-card__price">
                      {previousPrice ? <span className="featured-card__previous">{formatPrice(previousPrice)}</span> : null}
                      <span className="featured-card__current">{formatPrice(product.price)}</span>
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="featured-section__fallback">
            <p>No hay productos destacados disponibles.</p>
          </div>
        )
      ) : null}
    </section>
  );
};

export default Featured;
