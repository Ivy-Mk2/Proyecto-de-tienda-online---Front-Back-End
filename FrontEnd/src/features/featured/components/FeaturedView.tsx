import { Product } from '../../../types/api';

type FeaturedViewProps = {
  products: Product[];
  loading: boolean;
  error: string;
  favoriteIds: string[];
  skeletonItems: string[];
  onRetry: () => Promise<void> | void;
  onAddToCart: (productId: string) => Promise<void> | void;
  onToggleFavorite: (productId: string) => Promise<void> | void;
};

const API_BASE_URL = (
  import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1'
).replace(/\/api\/v\d+$/, '');

const formatPrice = (price: string | number) => {
  const parsed = Number(price);
  if (Number.isNaN(parsed)) return String(price);

  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(parsed);
};

const resolveImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;
  return `${API_BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
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

export const FeaturedView = ({
  products,
  loading,
  error,
  favoriteIds,
  skeletonItems,
  onRetry,
  onAddToCart,
  onToggleFavorite,
}: FeaturedViewProps) => {
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
          <button type="button" onClick={() => void onRetry()}>
            Reintentar
          </button>
        </div>
      ) : null}

      {!loading && !error ? (
        products.length ? (
          <div className="featured-grid">
            {products.map((product) => {
              const primaryImage = resolveImageUrl(product.images[0]?.imageUrl);
              const secondaryImage = resolveImageUrl(
                product.images[1]?.imageUrl ?? product.images[0]?.imageUrl,
              );
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
                        onClick={() => void onToggleFavorite(product.id)}
                      >
                        <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
                      </button>
                      <button
                        type="button"
                        aria-label="Agregar al carrito"
                        onClick={() => void onAddToCart(product.id)}
                      >
                        <i className="fa-solid fa-cart-shopping"></i>
                      </button>
                      <button type="button" aria-label="Ver más opciones">
                        <i className="fa-solid fa-share-nodes"></i>
                      </button>
                    </div>
                  </div>

                  <div className="featured-card__content">
                    <h3>{product.name}</h3>
                    <p className="featured-card__price">
                      {previousPrice ? (
                        <span className="featured-card__previous">
                          {formatPrice(previousPrice)}
                        </span>
                      ) : null}
                      <span className="featured-card__current">
                        {formatPrice(product.price)}
                      </span>
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
