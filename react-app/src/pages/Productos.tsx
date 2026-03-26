import { Link } from 'react-router-dom';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import { Badge, OptimizedImage, PageStatus } from '../components/ui';
import { useProducts } from '../hooks/useProducts';
import { usePageUXState } from '../hooks/usePageUXState';

const Productos: React.FC = () => {
  const { products } = useProducts();
  const { pageState, retry, successMessage, showSuccess } = usePageUXState();

  if (pageState === 'loading') {
    return <PageStatus state="loading" title="Cargando productos" description="Trayendo catálogo" />;
  }

  if (pageState === 'error') {
    return (
      <PageStatus
        state="error"
        title="No se pudo cargar productos"
        description="Verifica conexión e inténtalo nuevamente."
        onRetry={retry}
      />
    );
  }

  if (!products.length) {
    return <PageStatus state="empty" title="Sin productos" description="Aún no hay productos para mostrar." />;
  }

  return (
    <div>
      <Header />
      <section className="featured">
        <div className="featured__header">
          <h3 className="featured__title">Productos</h3>
          <button onClick={() => showSuccess('Catálogo actualizado')} className="sale-banner__button">
            Actualizar catálogo
          </button>
          {successMessage ? <Badge variant="success">{successMessage}</Badge> : null}
        </div>
        <div className="featured__display">
          {products.map((product) => (
            <div className="product-card" key={product.id}>
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
              </div>
              <div className="product-card__description">
                <Link className="product-card__description" to="/product_detail">
                  {product.name}
                </Link>
              </div>
              <div className="product-card__price">
                <span className="product-card__price--original">${product.originalPrice.toFixed(2)}</span>
                <span className="product-card__price--discounted">${product.discountedPrice.toFixed(2)}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Productos;
