import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productsService } from '../services/products.service';
import { cartService } from '../services/cart.service';
import { favoritesService } from '../services/favorites.service';
import { Product } from '../types/api';
import { getApiErrorMessage } from '../hooks/useApiError';
import { resolveImageUrl } from '../lib/api/imageUrl';
import { useAuth } from '../context/AuthContext';
import './ProductDetailPage.css';

const formatPrice = (price: string | number) =>
  new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(price));

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [cartFeedback, setCartFeedback] = useState('');
  const [cartLoading, setCartLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!id) return;

    const load = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await productsService.getById(id);
        setProduct(data);
        setSelectedSize(data.sizes[0] ?? '');
        setSelectedColor(data.colors[0] ?? '');
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;

    const loadFav = async () => {
      try {
        const favs = await favoritesService.list();
        setIsFavorite(favs.some((f) => f.productId === id));
      } catch {
        // silencioso
      }
    };

    void loadFav();
  }, [id, isAuthenticated]);

  const onAddToCart = async () => {
    if (!product || !id) return;

    try {
      setCartLoading(true);
      setCartFeedback('');
      await cartService.addItem({ productId: id, quantity, isAuthenticated });
      setCartFeedback('¡Agregado al carrito!');
      setTimeout(() => setCartFeedback(''), 3000);
    } catch (err) {
      setCartFeedback(getApiErrorMessage(err));
    } finally {
      setCartLoading(false);
    }
  };

  const onToggleFavorite = async () => {
    if (!id || !isAuthenticated) return;

    const prev = isFavorite;
    setIsFavorite(!prev);
    try {
      if (prev) {
        await favoritesService.remove(id);
      } else {
        await favoritesService.add(id);
      }
    } catch {
      setIsFavorite(prev);
    }
  };

  if (loading) {
    return (
      <main className="container pd-page">
        <div className="pd-skeleton">
          <div className="pd-skeleton__gallery" />
          <div className="pd-skeleton__info">
            <div className="pd-skeleton__line pd-skeleton__line--title" />
            <div className="pd-skeleton__line" />
            <div className="pd-skeleton__line pd-skeleton__line--short" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="container">
        <p className="error">{error || 'Producto no encontrado.'}</p>
        <button onClick={() => navigate(-1)}>Volver</button>
      </main>
    );
  }

  const images = product.images.length ? product.images : [];

  return (
    <main className="container pd-page">
      <nav className="pd-breadcrumb">
        <Link to="/productos">Productos</Link>
        {product.category ? <> › <Link to={`/productos?category=${product.category}`}>{product.category}</Link></> : null}
        {' '} › <span>{product.name}</span>
      </nav>

      <div className="pd-layout">
        <div className="pd-gallery">
          <div className="pd-gallery__main">
            {images.length ? (
              <img
                src={resolveImageUrl(images[activeImage]?.imageUrl)}
                alt={images[activeImage]?.altText ?? product.name}
                className="pd-gallery__img"
              />
            ) : (
              <div className="pd-gallery__placeholder">Sin imagen</div>
            )}
          </div>
          {images.length > 1 ? (
            <div className="pd-gallery__thumbs">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  className={`pd-gallery__thumb ${activeImage === idx ? 'pd-gallery__thumb--active' : ''}`}
                  onClick={() => setActiveImage(idx)}
                  aria-label={`Imagen ${idx + 1}`}
                >
                  <img src={resolveImageUrl(img.imageUrl)} alt={img.altText ?? product.name} />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="pd-info">
          <h1 className="pd-info__name">{product.name}</h1>
          <p className="pd-info__category">{product.category}</p>
          <p className="pd-info__price">{formatPrice(product.price)}</p>
          <p className="pd-info__stock">
            {product.stock > 0 ? (
              <span className="pd-info__in-stock">En stock ({product.stock} disponibles)</span>
            ) : (
              <span className="pd-info__out-stock">Sin stock</span>
            )}
          </p>

          {product.description ? <p className="pd-info__description">{product.description}</p> : null}

          {product.sizes.length > 0 ? (
            <div className="pd-variants">
              <p className="pd-variants__label">Talla</p>
              <div className="pd-variants__options">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`pd-variants__option ${selectedSize === size ? 'pd-variants__option--active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {product.colors.length > 0 ? (
            <div className="pd-variants">
              <p className="pd-variants__label">Color</p>
              <div className="pd-variants__options">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    className={`pd-variants__option ${selectedColor === color ? 'pd-variants__option--active' : ''}`}
                    onClick={() => setSelectedColor(color)}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="pd-quantity">
            <p className="pd-variants__label">Cantidad</p>
            <div className="pd-quantity__controls">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={quantity <= 1}
                aria-label="Reducir cantidad"
              >
                −
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                disabled={quantity >= product.stock}
                aria-label="Aumentar cantidad"
              >
                +
              </button>
            </div>
          </div>

          <div className="pd-actions">
            <button
              className="pd-actions__cart"
              onClick={() => void onAddToCart()}
              disabled={cartLoading || product.stock === 0}
            >
              {cartLoading ? 'Agregando...' : 'Agregar al carrito'}
            </button>
            {isAuthenticated ? (
              <button
                className="pd-actions__fav"
                onClick={() => void onToggleFavorite()}
                aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
              >
                <i className={`${isFavorite ? 'fa-solid' : 'fa-regular'} fa-heart`} />
              </button>
            ) : null}
          </div>

          {cartFeedback ? (
            <p className={cartFeedback.includes('!') ? 'pd-feedback pd-feedback--ok' : 'pd-feedback pd-feedback--err'}>
              {cartFeedback}
            </p>
          ) : null}
        </div>
      </div>
    </main>
  );
};
