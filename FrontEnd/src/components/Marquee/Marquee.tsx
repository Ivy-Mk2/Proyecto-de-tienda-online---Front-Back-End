import { useMemo, useRef } from 'react';
import { Product } from '../../types/api';
import { useFeaturedProducts } from '../../hooks/useFeaturedProducts';
import styles from './Marquee.module.css';

type MarqueeProps = {
  products?: Product[];
  title?: string;
};

const API_BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api/v1').replace(/\/api\/v\d+$/, '');

const resolveImageUrl = (imageUrl?: string) => {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) return imageUrl;

  return `${API_BASE_URL}${imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`}`;
};

const formatPrice = (price: string | number) => {
  const numericPrice = Number(price);
  if (Number.isNaN(numericPrice)) return String(price);

  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(numericPrice);
};

const shortDescription = (description: string, maxLength = 80) => {
  if (!description) return '';
  if (description.length <= maxLength) return description;

  return `${description.slice(0, maxLength).trim()}...`;
};

const Marquee = ({ products: productsProp, title = 'Hot Sales' }: MarqueeProps) => {
  const { products: featuredProducts, loading, error } = useFeaturedProducts();
  const trackRef = useRef<HTMLDivElement>(null);

  const products = useMemo(
    () => (productsProp?.length ? productsProp : featuredProducts),
    [productsProp, featuredProducts],
  );

  const scrollByCard = (direction: 'left' | 'right') => {
    const track = trackRef.current;
    if (!track) return;

    const firstCard = track.querySelector<HTMLElement>(`[data-marquee-card='true']`);
    const cardWidth = firstCard?.offsetWidth ?? 320;
    const gap = 20;

    track.scrollBy({
      left: direction === 'right' ? cardWidth + gap : -(cardWidth + gap),
      behavior: 'smooth',
    });
  };

  return (
    <section className={styles.marquee} aria-label="Hot sales">
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <div className={styles.controls}>
          <button type="button" onClick={() => scrollByCard('left')} aria-label="Ver productos anteriores">
            ‹
          </button>
          <button type="button" onClick={() => scrollByCard('right')} aria-label="Ver productos siguientes">
            ›
          </button>
        </div>
      </div>

      {loading && !products.length ? <p className={styles.state}>Cargando ofertas...</p> : null}
      {error && !products.length ? <p className={styles.state}>No se pudo cargar Hot Sales: {error}</p> : null}

      {!loading && !error && !products.length ? (
        <p className={styles.state}>No hay productos disponibles para Hot Sales.</p>
      ) : null}

      {products.length ? (
        <div className={styles.track} ref={trackRef}>
          {products.map((product) => {
            const imageUrl = resolveImageUrl(product.images[0]?.imageUrl);

            return (
              <article className={styles.card} key={product.id} data-marquee-card="true">
                <div className={styles.imageWrap}>
                  {imageUrl ? (
                    <img
                      className={styles.image}
                      src={imageUrl}
                      alt={product.images[0]?.altText ?? product.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className={styles.placeholder}>Sin imagen</div>
                  )}
                  <span className={styles.price}>{formatPrice(product.price)}</span>
                </div>

                <div className={styles.content}>
                  <h3>{product.name}</h3>
                  {product.description ? <p>{shortDescription(product.description)}</p> : null}
                </div>
              </article>
            );
          })}
        </div>
      ) : null}
    </section>
  );
};

export default Marquee;
