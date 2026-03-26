import React from 'react';
import Header from '../components/Header/Header';
import Footer from '../components/Footer/Footer';
import Featured from '../components/Featured/Featured';
import './Product_detail.css';
import { Badge, OptimizedImage, PageStatus } from '../components/ui';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { usePageUXState } from '../hooks/usePageUXState';

const ProductDetail: React.FC = () => {
  const { products } = useProducts();
  const { addToCart } = useCart();
  const { pageState, retry, successMessage, showSuccess } = usePageUXState();
  const featuredProduct = products[0];

  if (pageState === 'loading') {
    return <PageStatus state="loading" title="Cargando producto" description="Preparando detalle." />;
  }

  if (pageState === 'error') {
    return (
      <PageStatus
        state="error"
        title="Error al cargar producto"
        description="No pudimos recuperar el detalle del producto."
        onRetry={retry}
      />
    );
  }

  if (!featuredProduct) {
    return <PageStatus state="empty" title="Producto no disponible" description="Prueba con otro producto." />;
  }

  return (
    <>
      <Header />
      <div>
        <main className="main">
          <div className="product-container">
            <section className="product-Img">
              <OptimizedImage src={featuredProduct.primaryImg} alt={featuredProduct.name} loading="eager" />
            </section>
            <section className="product-info">
              <h2 className="product-info__name">{featuredProduct.name}</h2>
              <span className="product-price">S/. {featuredProduct.discountedPrice.toFixed(2)} PEN</span>
              <div className="product-size">
                <label htmlFor="size">Tamaño</label>
                <select name="size" id="size" defaultValue="">
                  <option disabled value="">
                    Escoge una opcion
                  </option>
                  <option value="Small">S</option>
                  <option value="Medium">M</option>
                  <option value="Large">L</option>
                  <option value="Extralarge">XL</option>
                </select>
              </div>
              <div className="product-add">
                <div className="product-quantity">
                  <input
                    type="number"
                    placeholder="1"
                    defaultValue={1}
                    min="1"
                    className="input-quantity"
                  />
                  <div className="btn-quantity">
                    <i className="fa-solid fa-chevron-up"></i>
                    <i className="fa-solid fa-chevron-down"></i>
                  </div>
                </div>
                <div className="product-add__buttons">
                  <button
                    className="product-addCart__btn"
                    onClick={() => {
                      addToCart(featuredProduct.id);
                      showSuccess('Producto agregado al carrito');
                    }}
                  >
                    <i className="fa-solid fa-plus"></i>
                    Agregar al carrito
                  </button>
                  <button className="product-addNow__btn" aria-label="Comprar producto ahora">
                    Comprar ahora
                  </button>
                </div>
              </div>
              {successMessage ? <Badge variant="success">{successMessage}</Badge> : null}
              <div className="product-description">
                <h2>Descripción</h2>
                <p>{featuredProduct.description}</p>
              </div>
            </section>
          </div>
          <Featured title={'Quizas te puedan interesar'} customClass={'featured__title--small'} />
        </main>
      </div>
      <Footer />
    </>
  );
};

export default ProductDetail;
