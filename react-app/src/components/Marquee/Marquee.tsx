import Carousel from 'react-multi-carousel';
import 'react-multi-carousel/lib/styles.css';
import { Link } from 'react-router-dom';
import styles from './Marquee.module.css';
import { useProducts } from '../../hooks/useProducts';
import { OptimizedImage } from '../ui';

const Marquee = () => {
  const { products } = useProducts();
  const responsive = {
    superLargeDesktop: {
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 7,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 2,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 1,
    },
  };

  return (
    <>
      <div className={styles.marquee}>
        <div className={styles.marquee__title}>
          <h1>Hot Sales</h1>
        </div>
        <Carousel responsive={responsive}>
          {products.map((product) => (
            <div className={styles['product-card']} key={product.id}>
              <div className={styles['product-card__container']}>
                <div className={styles['product-card__img-container']}>
                  <OptimizedImage
                    src={product.primaryImg}
                    alt={product.description}
                    className={`${styles['product-card__img']} ${styles['product-card__img--primary']}`}
                  />
                  <div className={styles['product-card__price']}>
                    <span className={styles['product-card__price--original']}>
                      <Link className={styles['product-card__price--original']} to="/product_detail">
                        ${product.originalPrice.toFixed(2)}
                      </Link>
                    </span>
                  </div>
                </div>
                <div className={styles['product-card__description']}>
                  <Link className="product-card__description" to="/product_detail">
                    {product.description}
                  </Link>
                  <Link className={styles['product-card__shortDescription']} to="/product_detail">
                    {product.shortDescription}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      </div>
    </>
  );
};

export default Marquee;
