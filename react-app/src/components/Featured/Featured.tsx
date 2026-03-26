import { Link } from 'react-router-dom';
import './Featured.css';
import { FC } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useCart } from '../../hooks/useCart';
import { OptimizedImage } from '../ui';

interface FeaturedProps {
  title: string;
  customClass?: string;
  productClass?: string;
  featuredClass?: string;
}

const Featured: FC<FeaturedProps> = ({
  title,
  customClass = '',
  productClass = '',
  featuredClass = '',
}) => {
  const { featuredProducts } = useProducts();
  const { favorites, toggleFavorite, addToCart } = useCart();

  return (
    <div className={`featured ${featuredClass || 'featured'}`}>
      <div className="featured__header">
        <h3 className={`featured__title ${customClass}`}>{title}</h3>
      </div>
      <div className="featured__display">
        {featuredProducts.map((product) => (
          <div className={`product-card ${productClass || 'product-card'}`} key={product.id}>
            <div className="product-card__img-container">
              <OptimizedImage
                src={product.primaryImg}
                alt={product.description}
                className="product-card__img product-card__img--primary"
              />
              <OptimizedImage
                src={product.secondaryImg}
                alt={product.description}
                className="product-card__img product-card__img--secondary"
              />
              <div className="product-card__actions">
                <button
                  type="button"
                  aria-label="Agregar a favoritos"
                  onClick={() => toggleFavorite(product.id)}
                >
                  <i className={`fa-heart ${favorites.includes(product.id) ? 'fa-solid' : 'fa-regular'}`}></i>
                </button>
                <button type="button" aria-label="Agregar al carrito" onClick={() => addToCart(product.id)}>
                  <i className="fa-solid fa-cart-shopping"></i>
                </button>
                <button type="button" aria-label="Comparar producto">
                  <i className="fa-solid fa-shuffle"></i>
                </button>
              </div>
            </div>
            <div className="product-card__description">
              <Link className="product-card__description" to="/product_detail">
                {product.description}
              </Link>
            </div>
            <div className="product-card__price">
              <span className="product-card__price--original">
                <Link className="product-card__price--original" to="/product_detail">
                  ${product.originalPrice.toFixed(2)}
                </Link>
              </span>
              <span className="product-card__price--discounted">
                <Link className="product-card__price--discounted" to="/product_detail">
                  ${product.discountedPrice.toFixed(2)}
                </Link>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Featured;
