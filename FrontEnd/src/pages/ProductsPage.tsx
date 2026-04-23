import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { productsService } from '../services/products.service';
import { cartService } from '../services/cart.service';
import { Product } from '../types/api';
import { getApiErrorMessage } from '../hooks/useApiError';
import { resolveImageUrl } from '../lib/api/imageUrl';
import { useAuth } from '../context/AuthContext';
import './ProductsPage.css';

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(price));

export const ProductsPage = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedCategory = searchParams.get('category') ?? undefined;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addingId, setAddingId] = useState<string | null>(null);
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        setProducts(await productsService.list({ category: selectedCategory }));
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [selectedCategory]);

  const onAdd = async (productId: string) => {
    try {
      setAddingId(productId);
      await cartService.addItem({ productId, quantity: 1, isAuthenticated });
      setFeedbacks((prev) => ({ ...prev, [productId]: 'Agregado ✓' }));
      setTimeout(() => setFeedbacks((prev) => ({ ...prev, [productId]: '' })), 2500);
    } catch (err) {
      setFeedbacks((prev) => ({ ...prev, [productId]: getApiErrorMessage(err) }));
    } finally {
      setAddingId(null);
    }
  };

  return (
    <main className="container products-page">
      <div className="products-page__header">
        <h1>Productos</h1>
        {selectedCategory ? (
          <p className="products-page__category">
            Categoría: <strong>{selectedCategory}</strong>{' '}
            <Link to="/productos" className="products-page__clear">× Limpiar</Link>
          </p>
        ) : null}
      </div>

      {error ? <p className="error">{error}</p> : null}

      {loading ? (
        <div className="products-grid">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="product-card product-card--skeleton">
              <div className="product-card__image-wrap" />
              <div className="product-card__skeleton-line product-card__skeleton-line--title" />
              <div className="product-card__skeleton-line" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="products-empty">
          <p>No se encontraron productos{selectedCategory ? ` en "${selectedCategory}"` : ''}.</p>
          {selectedCategory ? <Link to="/productos">Ver todos los productos</Link> : null}
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => {
            const img = resolveImageUrl(product.images[0]?.imageUrl);
            const feedback = feedbacks[product.id];
            return (
              <article key={product.id} className="product-card">
                <Link to={`/productos/${product.id}`} className="product-card__image-link">
                  {img ? (
                    <img
                      src={img}
                      alt={product.images[0]?.altText ?? product.name}
                      className="product-card__image"
                      loading="lazy"
                    />
                  ) : (
                    <div className="product-card__placeholder">Sin imagen</div>
                  )}
                  {product.stock === 0 ? <span className="product-card__out-badge">Sin stock</span> : null}
                </Link>

                <div className="product-card__body">
                  <Link to={`/productos/${product.id}`} className="product-card__name">
                    {product.name}
                  </Link>
                  {product.category ? (
                    <Link
                      to={`/productos?category=${product.category}`}
                      className="product-card__category"
                    >
                      {product.category}
                    </Link>
                  ) : null}
                  <p className="product-card__price">{formatPrice(product.price)}</p>

                  <button
                    className="product-card__btn"
                    onClick={() => void onAdd(product.id)}
                    disabled={addingId === product.id || product.stock === 0}
                  >
                    {addingId === product.id
                      ? 'Agregando...'
                      : product.stock === 0
                        ? 'Sin stock'
                        : 'Agregar al carrito'}
                  </button>

                  {feedback ? (
                    <p className={`product-card__feedback ${feedback.includes('✓') ? 'product-card__feedback--ok' : 'product-card__feedback--err'}`}>
                      {feedback}
                    </p>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};
